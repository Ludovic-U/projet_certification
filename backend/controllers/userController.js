const { createJWT, verifyJWT } = require('../utils/jwt');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// const { isAdmin, isManager } = require('../utils/roles');
const { createSession, deleteSessions } = require('../services/sessionService');
const { findUserByEmailAndPassword } = require('../services/userService');



module.exports.loginPost = async (req, res) => {
    const { email, password } = req.body;
    // $2b$10$SsckLn71poxLmYmfC62kGuWc0YUJsOzQONkHZmwpyotRTfvglp7Fi
    // try {
    //     const hashedPassword = await bcrypt.hash('admin', parseInt(process.env.HASH_SALT));

    // } catch (error) {
    //     console.error('Error hashing password:', error);
    // }

    try {
        // find user by email or username
        const token = await findUserByEmailAndPassword(email, password, req);

        // Set the token in a cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1 * 24 * 60 * 60 * 1000, // 1 days
                //  D / H / Min / Sec / Ms
            path: '/',
        });

        res.json({ message: 'Login successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
};

module.exports.registerPost = async (req, res) => { // TODO : a refaire
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


module.exports.logout = async (req, res) => {
    console.log("Logging out user...");
    const crypto = require('crypto');
    const token = req.cookies.token;
    if (token) {
        const payload = verifyJWT(token);
        const userId = payload.userId;

        //delete every session of the user 
        await deleteSessions(userId);
    }
    console.log("User logged out, clearing cookie.");
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
}

