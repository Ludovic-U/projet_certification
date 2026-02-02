const crypto = require('crypto');
const { verifyJWT } = require('../utils/jwt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { findSession, extendSession } = require('../services/sessionService');

module.exports.authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const payload = verifyJWT(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const session = await findSession(payload.userId, token);
    if (!session) {
      return res.status(401).json({ error: 'Session not found or expired' });
    }

    // Optional: extend session (fire and forget)
    extendSession(session.id).catch(err => {
      console.error('Failed to extend session:', err);
      // Don't fail auth if extending fails
    });

    req.user = payload;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};
