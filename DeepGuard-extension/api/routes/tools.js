import express from 'express';
import multer from 'multer';
import { runFactCheck, detectImage, submitFeedback, detectVideo, aiChat, tempUpload } from '../controllers/toolsController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/factcheck', runFactCheck);
router.post('/detect-image', upload.single('image'), detectImage);
router.post('/detect-video', upload.single('video'), detectVideo);
router.post('/feedback', submitFeedback);
router.post('/ai-chat', aiChat);
router.post('/temp-upload', upload.single('image'), tempUpload);

export default router;
