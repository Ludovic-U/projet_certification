const Router = require('express');
const multer = require('multer');
const { testMistral, generateMindmapFromResponses } = require('../controllers/mistralController');


const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/generateGanttviaMistral', upload.single('file'), testMistral);
router.get('/generateMindmapFromResponses/:projectId', generateMindmapFromResponses);

module.exports = router;