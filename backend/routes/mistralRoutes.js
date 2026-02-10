const Router = require('express');
const multer = require('multer');
const { testMistral } = require('../controllers/mistralController');


const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/generateGanttviaMistral', upload.single('file'), testMistral);

module.exports = router;