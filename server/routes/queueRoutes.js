import express from 'express';
import { checkin, getMyQueueStatus } from '../controllers/queueController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/checkin', protect, checkin);
router.get('/my-status', protect, getMyQueueStatus);

export default router;
