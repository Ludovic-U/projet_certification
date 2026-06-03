const express = require('express');
const router = express.Router();
const {
  getTutorial,
  markTutorialViewed,
  getUserTutorials,
  getAllTutorials,
  createTutorialAdmin,
  updateTutorialAdmin,
  deleteTutorialAdmin,
  getTutorialDetails
} = require('../controllers/tutorialController');
const { authenticateUser } = require('../middlewares/auth');

// User routes
router.get('/page/:pageName', authenticateUser, getTutorial);
router.post('/mark-viewed', authenticateUser, markTutorialViewed);
router.get('/my-tutorials', authenticateUser, getUserTutorials);

// Admin routes
router.get('/admin/all', authenticateUser, getAllTutorials);
router.post('/admin/create', authenticateUser, createTutorialAdmin);
router.get('/admin/:tutorialId', authenticateUser, getTutorialDetails);
router.put('/admin/:tutorialId', authenticateUser, updateTutorialAdmin);
router.delete('/admin/:tutorialId', authenticateUser, deleteTutorialAdmin);

module.exports = router;
