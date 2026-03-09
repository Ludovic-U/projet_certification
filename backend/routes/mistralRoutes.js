const Router = require('express');
const multer = require('multer');
const { authorizeResource } = require('../middlewares/authorizationResource');
const { testMistral, generateMindmapFromResponses } = require('../controllers/mistralController');
const { authenticateUser } = require('../middlewares/auth');


const router = Router();
const upload = multer({ dest: 'uploads/' });

// Mistral AI routes require authentication
router.post('/generateGanttviaMistral', authenticateUser, upload.single('file'), testMistral);
router.get('/generateMindmapFromResponses/:projectId', authenticateUser, authorizeResource('project'), generateMindmapFromResponses);

module.exports = router;
