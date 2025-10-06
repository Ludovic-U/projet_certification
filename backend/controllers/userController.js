const { createJWT, verifyJWT } = require('../utils/jwt');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// const { isAdmin, isManager } = require('../utils/roles');
const { deleteSessions } = require('../services/sessionService');
const { authenticateAndCreateSession, createUser, requestPasswordReset, resetPassword } = require('../services/userService');



module.exports.loginPost = async (req, res) => {
    const { email, password } = req.body;
    if (password == undefined || password == null){ // verification important car les contributeurs n'ont pas de mot de passe.
        return res.status(400).json({ error: 'Password is required' });
    }

    try {
        // find user by email or username
        const token = await authenticateAndCreateSession(email, password, req);

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

module.exports.logout = async (req, res) => {
    console.log("Logging out user...");
    const token = req.cookies.token;
    if (token) {
        const payload = verifyJWT(token);
        const userId = payload.userId;

        //delete every session of the user
        try {
            await deleteSessions(userId);
        } catch (error) {
            res.status(500).json({ error: 'Error logging out' });
        }
        
    }
    console.log("User logged out, clearing cookie.");
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
}

module.exports.registerPost = async (req, res) => {
    const user = req.user;
    const {clientId, firstname, lastname, email, position, role } = req.body;
    if (!clientId || !firstname || !lastname || !email || !role) {
        return res.status(400).json({ error: 'Champs requis manquants' });
    }
    try {
        const newUser = await createUser(user, clientId, firstname, lastname, email, position, role );
        res.status(201).json({ message: 'User created successfully', userId: user.userId, newUser:newUser });
    } catch (err) {
        if (err.code === 'P2002') {
            // throw new Error('Un utilisateur avec ce username ou email existe déjà');
            res.status(400).json({ error: 'Un utilisateur avec ce username ou email existe déjà' });
        }
        console.error(err);
        res.status(500).json({ error: 'Error creating user ' + err });
    }
};

// forgot password request, sends email with reset link
module.exports.forgotPasswordPost = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    try {
        requestPasswordReset(email);
        res.status(200).json({ message: 'email sent if the email is registered' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error processing request' });
    } 
}

// reset password form submission, with new password and consumme the token
module.exports.resetPasswordPost = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  try {
    await resetPassword(token, newPassword);
    return res.json({ message: 'Password reset successful' });
  } catch (err) {
    if (err.message === 'Invalid token') {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    if (err.message === 'Weak password') {
      return res.status(400).json({ error: 'Password does not meet security requirements' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

//get users by clientId
module.exports.getUsersByClientId = async (req, res) => {
    const clientId = Number(req.params.clientId);
    if (isNaN(clientId)) {
        return res.status(400).json({ error: 'Invalid clientId' });
    }
    try {
        const users = await this.getUsersByClientId(req.user, clientId);
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching users' });
    }
};



