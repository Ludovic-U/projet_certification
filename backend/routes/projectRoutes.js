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
const { authorizeResource } = require('../middlewares/authorizeResource');
const router = Router();

// These routes check user's own projects - different authorization
router.get('/getByClientId/:clientId', authenticateUser, getProjectsByClientId);
router.get('/user/:userId', authenticateUser, getProjectsByUserIdGet);

// All project-scoped routes require authorization
router.post('/create', authenticateUser, authorizeResource('project'), createProjectPost);
router.put('/:projectId', authenticateUser, authorizeResource('project'), updateProjectPost);
router.delete('/:projectId', authenticateUser, authorizeResource('project'), deleteProjectPost);

// SWOT routes
router.post('/:projectId/swot', authenticateUser, authorizeResource('project'), updateProjectSwotPost);
router.get('/:projectId/swot', authenticateUser, authorizeResource('project'), getProjectSwotGet);
router.post('/:projectId/swot/generate', authenticateUser, authorizeResource('project'), generateProjectSwotPost);

// Go/NoGo route
router.post('/:projectId/go-nogo', authenticateUser, authorizeResource('project'), updateProjectGoNogoPost);

// Decision routes (feasibility analysis)
router.get('/:projectId/decisions', authenticateUser, authorizeResource('project'), getProjectDecisionsGet);
router.post('/:projectId/decisions', authenticateUser, authorizeResource('project'), updateProjectDecisionPost);

// Impact routes (ideation phase)
router.get('/:projectId/impact', authenticateUser, authorizeResource('project'), getProjectImpactsGet);
router.post('/:projectId/impact', authenticateUser, authorizeResource('project'), updateProjectImpactPost);
router.delete('/:projectId/impact/:impactId', authenticateUser, authorizeResource('project'), deleteProjectImpactDelete);

module.exports = router;