const { Router } = require('express')
const { asyncHandler } = require('../utils/asyncHandler.js')
const { 
  getProjectsByClientId, 
  createProjectPost,
  updateProjectSwotPost,
  getProjectSwotGet 
} = require('../controllers/projectController');
const { authenticateUser } = require('../middlewares/auth');
const router = Router()

// Use the imported asyncHandler
router.get('/getByClientId/:clientId', asyncHandler(authenticateUser), getProjectsByClientId);
router.post('/create', asyncHandler(authenticateUser), createProjectPost);

// SWOT routes
router.post('/:projectId/swot', asyncHandler(authenticateUser), updateProjectSwotPost);
router.get('/:projectId/swot', asyncHandler(authenticateUser), getProjectSwotGet);

module.exports = router;
