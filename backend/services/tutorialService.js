const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports.getTutorialForPage = async (userId, pageName) => {
  try {
    const tutorial = await prisma.tutorialPage.findUnique({
      where: { pageName }
    });

    if (!tutorial || !tutorial.isActive) return null;

    // Check if user has already seen this tutorial
    const hasViewed = await prisma.userTutorialView.findUnique({
      where: {
        userId_tutorialId: { userId, tutorialId: tutorial.tutorialId }
      }
    });

    return {
      ...tutorial,
      shouldShow: !hasViewed, // Show only if not viewed before
      isFirstTime: !hasViewed
    };
  } catch (err) {
    console.error('Error getting tutorial:', err);
    throw err;
  }
};

module.exports.markTutorialAsViewed = async (userId, tutorialId, completed = false) => {
  try {
    return await prisma.userTutorialView.upsert({
      where: {
        userId_tutorialId: { userId, tutorialId }
      },
      update: { completed },
      create: { userId, tutorialId, completed }
    });
  } catch (err) {
    console.error('Error marking tutorial as viewed:', err);
    throw err;
  }
};

module.exports.getAllActiveTutorials = async () => {
  try {
    return await prisma.tutorialPage.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
  } catch (err) {
    console.error('Error getting all tutorials:', err);
    throw err;
  }
};

module.exports.getUserTutorialsStatus = async (userId) => {
  try {
    const tutorials = await prisma.tutorialPage.findMany({
      where: { isActive: true },
      include: {
        userViewings: {
          where: { userId },
          select: { completed: true, viewedAt: true }
        }
      },
      orderBy: { order: 'asc' }
    });

    return tutorials.map(tutorial => ({
      tutorialId: tutorial.tutorialId,
      pageName: tutorial.pageName,
      title: tutorial.title,
      viewed: tutorial.userViewings.length > 0,
      completed: tutorial.userViewings[0]?.completed || false,
      viewedAt: tutorial.userViewings[0]?.viewedAt || null
    }));
  } catch (err) {
    console.error('Error getting user tutorials status:', err);
    throw err;
  }
};

// Admin functions
module.exports.createTutorial = async (data) => {
  try {
    return await prisma.tutorialPage.create({
      data: {
        pageName: data.pageName,
        title: data.title,
        description: data.description,
        content: data.content,
        order: data.order || 0,
        isActive: data.isActive !== false
      }
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new Error(`Tutorial pour la page "${data.pageName}" existe déjà`);
    }
    console.error('Error creating tutorial:', err);
    throw err;
  }
};

module.exports.updateTutorial = async (tutorialId, data) => {
  try {
    return await prisma.tutorialPage.update({
      where: { tutorialId },
      data
    });
  } catch (err) {
    console.error('Error updating tutorial:', err);
    throw err;
  }
};

module.exports.deleteTutorial = async (tutorialId) => {
  try {
    return await prisma.tutorialPage.delete({
      where: { tutorialId }
    });
  } catch (err) {
    console.error('Error deleting tutorial:', err);
    throw err;
  }
};

module.exports.getTutorialById = async (tutorialId) => {
  try {
    return await prisma.tutorialPage.findUnique({
      where: { tutorialId }
    });
  } catch (err) {
    console.error('Error getting tutorial by ID:', err);
    throw err;
  }
};
