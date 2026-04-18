import express from 'express';
import multer from 'multer';
import { runFactCheck, detectImage } from '../controllers/toolsController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/factcheck', runFactCheck);
router.post('/detect-image', upload.single('image'), detectImage);

export default router;
