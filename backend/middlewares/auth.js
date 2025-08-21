const crypto = require('crypto');
const { verifyJWT } = require('../utils/jwt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.authenticateUser = async (req, res, next) => {
  console.log('Authenticating user...');
  const token = req.cookies.token;
  console.log('Token:', token);
  if (!token) return res.status(401).json({ error: 'No token' });

  const payload = verifyJWT(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });

  const session = this.findSession(payload.userId, token);
  if (!session) return res.status(401).json({ error: 'Session not found' });

  req.user = payload;
  console.log('User authenticated:', req.user);
  return res.status(200).json({ data: req.user });
};

module.exports.findSession = async ( userId, token) => {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    return await prisma.userSession.findFirst({
    where: { userId: userId, tokenHash },
  });
}



