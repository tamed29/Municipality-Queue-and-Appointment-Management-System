import express from 'express';
import { createAppointment, getMyAppointments, cancelAppointment } from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createAppointment);
router.get('/my', protect, getMyAppointments);
router.delete('/:id', protect, cancelAppointment);

export default router;
