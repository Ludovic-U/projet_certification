const { Router } = require('express')
const { 
  getProjectsByClientId, 
  createProjectPost,
  updateProjectSwotPost,
  getProjectSwotGet 
} = require('../controllers/projectController');
const { authenticateUser } = require('../middlewares/auth');
const router = Router()

router.get('/getByClientId/:clientId', authenticateUser, getProjectsByClientId);
router.post('/create', authenticateUser, createProjectPost);

// SWOT routes
router.post('/:projectId/swot', authenticateUser, updateProjectSwotPost);
router.get('/:projectId/swot', authenticateUser, getProjectSwotGet);

module.exports = router;