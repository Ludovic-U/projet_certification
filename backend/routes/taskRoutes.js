const { Router } = require('express')
const { 
  gettasksByClientId,  
  createtaskPost,
  updatetaskSwotPost,  // ← Changed from updateTaskSwotPost to updatetaskSwotPost
  gettaskSwotGet       // ← Also changed from getTaskSwotGet to gettaskSwotGet
} = require('../controllers/taskController');
const { authenticateUser } = require('../middlewares/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const router = Router()

router.get('/getByClientId/:clientId', asyncHandler(authenticateUser), gettasksByClientId);
router.post('/create', asyncHandler(authenticateUser), createtaskPost);

// SWOT routes - use the correct function names
router.post('/:taskId/swot', asyncHandler(authenticateUser), updatetaskSwotPost);  // ← Use updatetaskSwotPost
router.get('/:taskId/swot', asyncHandler(authenticateUser), gettaskSwotGet);       // ← Use gettaskSwotGet

module.exports = router;
