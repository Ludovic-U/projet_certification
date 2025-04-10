const { createJWT } = require('../utils/jwt');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
const { isAdmin, isManager } = require('../utils/roles');



module.exports.loginPost = async (req, res) => {
    const { email, password } = req.body;
    // $2b$10$SsckLn71poxLmYmfC62kGuWc0YUJsOzQONkHZmwpyotRTfvglp7Fi
    try {
        const hashedPassword = await bcrypt.hash('admin', parseInt(process.env.HASH_SALT));
        console.log(hashedPassword);

    } catch (error) {
        console.error('Error hashing password:', error);
    }

    try {
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

        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const roles = user.roles.map((ur) => ur.role.roleName);
        const permissions = user.roles.flatMap((ur) =>
            ur.role.rolePermissions.map((rp) => rp.permission.permName)
        );

        const clientData = user.clientUserRoles[0] || null;

        const tokenPayload = {
            userId: user.userId,
            roles,
            permissions,
            clientId: clientData?.clientId || null,
            isManager: clientData?.isManager || false,
            position: clientData?.position || null,
        };

        const token = createJWT(tokenPayload);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1 * 24 * 60 * 60 * 1000, // 1 days
                //  D / H / Min / Sec / Ms
        });

        res.json({ message: 'Login successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
};

module.exports.registerPost = async (req, res) => {
    const { clientId } = req.params;
    const token = req.cookies.token;
    const user = req.user;
    if (!token) return res.status(401).json({ error: 'Unauthorized no token' });
    if (!user) return res.status(401).json({ error: 'Unauthorized no user' });
    const isAdminUser = isAdmin(user);
    const isManagerUserWithClient = isManager(user) && user.clientId == clientId;
    if (!isAdminUser && !isManagerUserWithClient) {
        return res.status(403).json({ error: 'Forbidden - Insufficient permissions !!!' });
      }
    const { username, firstname, lastname, email, password, manager, position, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.HASH_SALT));

        // 1. Create the user
        const user = await prisma.user.create({
            data: {
                firstname,
                lastname,
                email,
                password: hashedPassword,
                username
            },
        });

        // 2. Link to client
        await prisma.clientUserRole.create({
            data: {
                clientId: parseInt(clientId),
                userId: user.userId,
                isManager: manager ?? false,
                position: position ?? null,
            },
        });

        // 3.  Assign  role 
        const Role = await prisma.role.findFirst({
            where: { roleName: role ?? 'contributor' },
        });

        if (Role) {
            await prisma.userRole.create({
                data: {
                    userId: user.userId,
                    roleId: Role.roleId,
                },
            });
        }

        res.status(201).json({ message: 'User created successfully', userId: user.userId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating user' });
    }
};


module.exports.logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    res.status(200).json({ message: 'Logout successful' });
}