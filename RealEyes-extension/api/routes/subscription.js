import express from 'express';
import { getSubscriptionStatus, upgradePlan, consumeSession } from '../controllers/subscriptionController.js';

const router = express.Router();

router.get('/status', getSubscriptionStatus);
router.post('/upgrade', upgradePlan);
router.post('/consume', consumeSession);

export default router;
