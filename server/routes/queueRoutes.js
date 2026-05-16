import express from 'express';
import { checkin, getMyQueueStatus, getQueueSummary } from '../controllers/queueController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/checkin', protect, checkin);
router.get('/my-status', protect, getMyQueueStatus);
router.get('/summary', getQueueSummary);

export default router;
