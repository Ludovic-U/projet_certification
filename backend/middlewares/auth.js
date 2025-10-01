const crypto = require('crypto');
const { verifyJWT } = require('../utils/jwt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { findSession, extendSession } = require('../services/sessionService');

module.exports.authenticateUser = async (req, res, next) => {
  console.log('Authenticating user...');
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'No token' });
  console.log('Token found:', token);

  const payload = verifyJWT(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });
  console.log('Token verified, payload:', payload);

  const session = await findSession(payload.userId, token);
  if (!session) return res.status(401).json({ error: 'Session not found' });
  console.log('Session found:', session);

  extendSession(session.id); // pas besoin de await, si ça échoue, pas grave.

  req.user = payload;
  console.log('User authenticated:', session, req.user);
  // return res.status(200).json({ data: req.user });
  // no response because we want to continue to the next middleware or route handler.
  next();
};

// module.exports.findSession = async ( userId, token) => {
//     const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
//     return await prisma.userSession.findFirst({
//       where: {
//         userId,
//         tokenHash,
//         expiresAt: {
//           gt: new Date() // gt in prisma means "greater than" (i.e., not expired)
//         }
//       }
//     });
// };

// module.exports.extendSession = async (sessionId, additionalHours = 24) => { // TODO: enlever le chiffre magique. 
//   const newExpirationDate = new Date();
//   newExpirationDate.setHours(newExpirationDate.getHours() + additionalHours);

//   prisma.userSession.update({
//     where: { id: sessionId },
//     data: {
//       expiresAt: newExpirationDate
//     }
//   });
// };




