const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { createJWT } = require('../utils/jwt');
const { createSession } = require('../services/sessionService');

class User {
  constructor(firstname, lastname, email, roleList = [], tasks = []) {
    this.firstname = firstname;
    this.lastname = lastname;
    this.email = email;
    this.roleList = roleList; // Array of roles
    this.tasks = tasks; // Array of tasks
  }
}

// récupère un utilisateur par email ou username et password, vérifie le mot de passe, crée un token JWT et une session, et retourne un token pour le front
module.exports.findUserByEmailAndPassword = async (email, password, req) => {
     const user = await prisma.user.findFirst({
         where: {
             OR:
                 [{ email },
                 { username: email },
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
     );
    const tokenPayload = {
        clientId: clientData?.clientId || null,
        userId: user.userId,
        permissions: permissions,
        createdAT: Date.now
    };
    const token = createJWT(tokenPayload);

    // hash the token before storing it in the database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex'); 
    try {
        await createSession(user.userId, tokenHash, req);
    } catch (error) {
        throw new Error('Error creating session');
    }   

     return token;
}

module.exports.getUsersByClientId = async (clientId, permissions) => {
    //  si la requete ne vient pas d'un super_admin ou d'un'admin client
    if (!permissions.includes('user:read:any') || !permissions.includes('user:read:org')) {
        throw new Error('getUsersByClientId: Unauthorized');
    }

    const userlist = await prisma.user.findMany({
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
    return userlist;
}

// module.exports.getUsersByProjectId = async (projectId) => {
//     return "placeholder";
// }

// module.exports.createUser = async (userForm) => {}

// module.exports.deleteUser = async (userId, ) => {}