const express = require('express');
const multer = require('multer');
const { testMistral } = require('../controllers/mistralController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/generateGanttviaMistral', upload.single('file'), testMistral);

module.exports = router;