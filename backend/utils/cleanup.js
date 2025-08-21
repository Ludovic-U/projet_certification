await prisma.userSession.deleteMany({
  where: { expiresAt: { lt: new Date() } }
});