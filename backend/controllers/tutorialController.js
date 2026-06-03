const {
  getTutorialForPage,
  markTutorialAsViewed,
  getAllActiveTutorials,
  getUserTutorialsStatus,
  createTutorial,
  updateTutorial,
  deleteTutorial,
  getTutorialById
} = require('../services/tutorialService');

// User endpoints
module.exports.getTutorial = async (req, res) => {
  const { pageName } = req.params;
  const userId = req.user.userId;

  try {
    const tutorial = await getTutorialForPage(userId, pageName);
    if (!tutorial) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }
    res.json(tutorial);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération du tutoriel' });
  }
};

module.exports.markTutorialViewed = async (req, res) => {
  const { tutorialId } = req.body;
  const userId = req.user.userId;

  if (!tutorialId) {
    return res.status(400).json({ error: 'tutorialId is required' });
  }

  try {
    await markTutorialAsViewed(userId, tutorialId, true);
    res.json({ message: 'Tutoriel marqué comme vu' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

module.exports.getUserTutorials = async (req, res) => {
  const userId = req.user.userId;

  try {
    const tutorials = await getUserTutorialsStatus(userId);
    res.json(tutorials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des tutoriels' });
  }
};

// Admin endpoints
module.exports.getAllTutorials = async (req, res) => {
  try {
    const tutorials = await getAllActiveTutorials();
    res.json(tutorials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des tutoriels' });
  }
};

module.exports.createTutorialAdmin = async (req, res) => {
  const { pageName, title, description, content, order } = req.body;

  if (!pageName || !title || !content) {
    return res.status(400).json({ error: 'pageName, title, et content sont requis' });
  }

  try {
    const tutorial = await createTutorial({
      pageName,
      title,
      description,
      content,
      order: order || 0
    });
    res.status(201).json(tutorial);
  } catch (err) {
    console.error(err);
    if (err.message.includes('existe déjà')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Erreur lors de la création du tutoriel' });
  }
};

module.exports.updateTutorialAdmin = async (req, res) => {
  const { tutorialId } = req.params;
  const { title, description, content, order, isActive } = req.body;

  if (!tutorialId || isNaN(tutorialId)) {
    return res.status(400).json({ error: 'tutorialId invalide' });
  }

  try {
    const tutorial = await updateTutorial(parseInt(tutorialId), {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(content && { content }),
      ...(order !== undefined && { order }),
      ...(isActive !== undefined && { isActive })
    });
    res.json(tutorial);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du tutoriel' });
  }
};

module.exports.deleteTutorialAdmin = async (req, res) => {
  const { tutorialId } = req.params;

  if (!tutorialId || isNaN(tutorialId)) {
    return res.status(400).json({ error: 'tutorialId invalide' });
  }

  try {
    await deleteTutorial(parseInt(tutorialId));
    res.json({ message: 'Tutoriel supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression du tutoriel' });
  }
};

module.exports.getTutorialDetails = async (req, res) => {
  const { tutorialId } = req.params;

  if (!tutorialId || isNaN(tutorialId)) {
    return res.status(400).json({ error: 'tutorialId invalide' });
  }

  try {
    const tutorial = await getTutorialById(parseInt(tutorialId));
    if (!tutorial) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }
    res.json(tutorial);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération du tutoriel' });
  }
};
