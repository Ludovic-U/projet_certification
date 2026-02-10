const { Router } = require('express')
const { 
  getProjectsByClientId, 
  createProjectPost,
  updateProjectPost,
  updateProjectSwotPost,
  getProjectSwotGet,
  updateProjectGoNogoPost,
  getProjectsByUserIdGet
} = require('../controllers/projectController');
const { authenticateUser } = require('../middlewares/auth');
const router = Router()

router.get('/getByClientId/:clientId', authenticateUser, getProjectsByClientId);
router.get('/user/:userId', authenticateUser, getProjectsByUserIdGet);
router.post('/create', authenticateUser, createProjectPost);
router.put('/:projectId', authenticateUser, updateProjectPost);

// SWOT routes
router.post('/:projectId/swot', authenticateUser, updateProjectSwotPost);
router.get('/:projectId/swot', authenticateUser, getProjectSwotGet);

// Go/NoGo route
router.post('/:projectId/go-nogo', authenticateUser, updateProjectGoNogoPost);

module.exports = router;