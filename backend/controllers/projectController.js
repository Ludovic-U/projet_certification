const { Router } = require('express')
const { 
  getProjectsByClientId, 
  createProjectPost,
  updateProjectSwotPost,
  getProjectSwotGet 
} = require('../controllers/projectController');
const { authenticateUser } = require('../middlewares/auth');
const router = Router()

// Make sure authenticateUser is a valid middleware function
// If authenticateUser is not defined or is not a function, wrap it or remove it temporarily for debugging
router.get('/getByClientId/:clientId', authenticateUser, getProjectsByClientId);

// For create route, make sure createProjectPost is a function
router.post('/create', authenticateUser, createProjectPost);

// SWOT routes
router.post('/:projectId/swot', authenticateUser, updateProjectSwotPost);
router.get('/:projectId/swot', authenticateUser, getProjectSwotGet);

module.exports = router;
