const { Router } = require("express");
const multer = require('multer');
const { testMistral } = require('../controllers/mistralController.js');
// import multer from 'multer';
// import { testMistral } from '../controllers/mistralController.js';


const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/generateGanttviaMistral', upload.single('file'), testMistral);
// router.post('/testUploadFile', upload.single('file'), testMistral);

module.exports = router;