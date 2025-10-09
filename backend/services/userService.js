const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { createJWT } = require('../utils/jwt');
const { createSession, deleteSessions } = require('../services/sessionService');
const { hashToken, hashPassword } = require('../utils/hash');
const { checkPermission } = require('../utils/roles');
const { assignRoleToUser } = require('./roleService');

// récupère un utilisateur par email ou username et password, vérifie le mot de passe, crée un token JWT et une session, et retourne un token pour le front
//TODO: rename to authenticateUser? 
module.exports.authenticateAndCreateSession = async (emailOrUsername, password, req) => {
     const user = await prisma.user.findFirst({
         where: {
             OR:
                 [{ email: emailOrUsername },
                 { username: emailOrUsername },
                 ]
         },
         include: {
             roles: {
                 include: {
                     role: {
                         include: {
                             rolePermissions: {
                                 include: {
                                     permission: true,
                                 },
                             },
                         },
                     },
                 },
             },
             clientUserRoles: true,
         },
     });

     if (!user) throw new Error('Invalid credentials'); // User not found

     const validPassword = await bcrypt.compare(password, user.password); // Invalid password
     if (!validPassword) throw new Error('Invalid credentials');


     // Create token payload
     const clientData = user.clientUserRoles[0] || null;
     const roles = user.roles.map((userRole) => userRole.role.roleName);
     const permissions = user.roles.flatMap((userRole) =>
        userRole.role.rolePermissions.map((rolePerm) => rolePerm.permission.permName)
     )
     ;
    const tokenPayload = {
        clientId: clientData?.clientId || null,
        userId: user.userId,
        roles: roles,
        permissions: permissions,
        createdAT: Date.now
    };
    const token = createJWT(tokenPayload);

    // hash the token before storing it in the database
    const tokenHash = hashToken(token) //crypto.createHash('sha256').update(token).digest('hex'); 
    try {
        await createSession(user.userId, tokenHash, req);
    } catch (error) {
        throw new Error('Error creating session');
    }   

     return token;
}

module.exports.UsersByClientId = async (askingUser, clientId) => {
    //  si la requete ne vient pas d'un super_admin ou d'un'admin client
    checkPermission(askingUser, ["user:read:any", "user:read:org"]);

    const users = await prisma.user.findMany({
      where: {
        clientUserRoles: {
          some: {
            clientId: clientId
          }
        }
      },
      include: {
        clientUserRoles: true,
        roles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Exclure le mot de passe et ne sortir que le nom du premier rôle
    const userlist = users.map(user => ({
      userId: user.userId,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      clientUserRoles: user.clientUserRoles,
      role: user.roles.length > 0 ? user.roles[0].role.roleName : null
    }));
    return userlist;
}

// Crée un utilisateur sans mot de passe, par défaut contributeur, et le lie à un client si clientId est fourni
// si un autre role que contributor est demandé, envoie un mail à l'utilisateur pour initialiser son mot de passe
 module.exports.createUser = async ( askingUser, clientId, firstname, lastname, email, position, role ) => { // TODO: faire une transaction prisma
    // Vérifie les permissions de l'utilisateur demandant la création
    checkPermission(askingUser, ["user:create:any", "user:create:org"]);
    const hasAny = askingUser.permissions.includes("user:create:any");
    const hasOrg = askingUser.permissions.includes("user:create:org");

    if (!hasAny || (  !hasOrg && askingUser.clientId !== clientId) ) {
        throw new Error('createUser: Unauthorized - insufficient permissions');
    }

    // Vérifie si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });
    if (existingUser) {
        throw new Error('Un utilisateur avec cet email existe déjà');
    }

    // 1. Create user
    const newUser = await prisma.user.create({
      data: {
        username: firstname.toLowerCase() + '.' + lastname.toLowerCase(), // username par défaut
        firstname,
        lastname,
        email,
        password: null,
      },
    });

    // 2. Link to client
    await prisma.clientUserRole.create({
      data: {
        clientId: parseInt(clientId),
        userId: newUser.userId,
        position: position ?? null,
      },
    });


    // TODO: update role service
    await assignRoleToUser( askingUser, newUser.userId, role ?? 'contributeur' );   
    

    return newUser;

};

// module.exports.deleteUser = async (userId, ) => {}

// ask for a password reset
module.exports.requestPasswordReset = async (email) => {
  // pas de check de permission car un utilisateur peut avoir oublié son mdp
  const user = await prisma.user.findUnique({
    where: { email }
  });
  if (!user) {
    throw new Error("requestPasswordReset : Utilisateur introuvable");
  }
  // generate a reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now TODO: remove hardcoding
  createSession(user.userId, resetToken, null, resetTokenExpiry); // TOKEN A USAGE UNIQUE

  // send email with the reset link
  const { sendResetPasswordEmail } = require('../utils/mailer');
  sendResetPasswordEmail(user.email, resetToken, user.password === null); // if password is null, it's a first connection
}

// set or reset password
module.exports.resetPassword = async (resetToken, newPassword) => {

  const session = await prisma.userSession.findFirst({ // find the session with this reset token
    where: {
      tokenHash: resetToken,
    }
  });
  if (!session) {
    throw new Error("resetPassword : Token invalide ou expiré");
  }

  const userId = session.userId;
  deleteSessions(session.userId); // delete all sessions for this user, including the reset token session

  // Mise à jour du mdp
  const hashedPassword = await hashPassword(newPassword); // hash du mot de passe
  await prisma.user.update({
    where: { userId },
    data: { password: hashedPassword }
  });
}

module.exports.updatePassword = async (userId, oldPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { userId }
  });
  if (!user) {
    throw new Error("Utilisateur introuvable");
  }

  // Vérifie l'ancien mot de passe
  const isValid = await bcrypt.compare(oldPassword, user.password);
  if (!isValid) {
    throw new Error("Ancien mot de passe incorrect");
  }

  // Hash du nouveau mot de passe
  const hashedPassword = hashPassword(newPassword);

  // Mise à jour en DB
  await prisma.user.update({
    where: { userId },
    data: { password: hashedPassword }
  });

  return { message: "Mot de passe mis à jour avec succès" };
};