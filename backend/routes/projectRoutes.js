const { Router } = require('express')
const { 
  getProjectsByClientId, 
  createProjectPost,
  updateProjectPost,
  deleteProjectPost,
  updateProjectSwotPost,
  getProjectSwotGet,
  generateProjectSwotPost,
  updateProjectGoNogoPost,
  getProjectsByUserIdGet,
  getProjectDecisionsGet,
  updateProjectDecisionPost,
  getProjectImpactsGet,
  updateProjectImpactPost,
  deleteProjectImpactDelete
} = require('../controllers/projectController');
const { authenticateUser } = require('../middlewares/auth');
const router = Router()

router.get('/getByClientId/:clientId', authenticateUser, getProjectsByClientId);
router.get('/user/:userId', authenticateUser, getProjectsByUserIdGet);
router.post('/create', authenticateUser, createProjectPost);
router.put('/:projectId', authenticateUser, updateProjectPost);
router.delete('/:projectId', authenticateUser, deleteProjectPost);

// SWOT routes
router.post('/:projectId/swot', authenticateUser, updateProjectSwotPost);
router.get('/:projectId/swot', authenticateUser, getProjectSwotGet);
router.post('/:projectId/swot/generate', authenticateUser, generateProjectSwotPost);

// Go/NoGo route
router.post('/:projectId/go-nogo', authenticateUser, updateProjectGoNogoPost);

// Decision routes (feasibility analysis)
router.get('/:projectId/decisions', authenticateUser, getProjectDecisionsGet);
router.post('/:projectId/decisions', authenticateUser, updateProjectDecisionPost);

// Impact routes (ideation phase)
router.get('/:projectId/impact', authenticateUser, getProjectImpactsGet);
router.post('/:projectId/impact', authenticateUser, updateProjectImpactPost);
router.delete('/:projectId/impact/:impactId', authenticateUser, deleteProjectImpactDelete);

module.exports = router;