// TODO: Cleanup expired sessions periodically


await prisma.userSession.deleteMany({
  where: { expiresAt: { lt: new Date() } }
});
