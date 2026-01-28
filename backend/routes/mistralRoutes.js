import express from 'express';
import multer from 'multer';
import { testMistral } from '../controllers/mistralController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/generateGanttviaMistral', upload.single('file'), testMistral);
// router.post('/testUploadFile', upload.single('file'), testMistral);

export default router;