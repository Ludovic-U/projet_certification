const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { hashToken } = require('../utils/hash');
const prisma = new PrismaClient();

const sessionDurationHours = 24; // Default session duration


module.exports.findSession = async ( userId, token) => {
    const tokenHash = hashToken(token) //crypto.createHash('sha256').update(token).digest('hex');
    return await prisma.userSession.findFirst({
      where: {
        userId,
        tokenHash,
        expiresAt: {
          gt: new Date() // gt in prisma means "greater than" (i.e., not expired)
        }
      }
    });
};

module.exports.extendSession = async (sessionId, additionalHours = sessionDurationHours) => {
  const newExpirationDate = new Date();
  newExpirationDate.setHours(newExpirationDate.getHours() + additionalHours);

  prisma.userSession.update({
    where: { id: sessionId },
    data: {
      expiresAt: newExpirationDate
    }
  });
};

module.exports.createSession = async (userId, tokenHash, req = null, durationHours = sessionDurationHours) => {
    await prisma.userSession.create({
        data: {
            userId: userId,
            tokenHash: tokenHash,
            expiresAt: new Date(Date.now() + durationHours * 60 * 60 * 1000), 
            ip: req?.ip || null,
            userAgent: req?.headers?.['user-agent'] || null,
        },
        });
}

module.exports.deleteSessions = async (userId) => {
    await prisma.userSession.deleteMany({ where: { userId } });
    
}