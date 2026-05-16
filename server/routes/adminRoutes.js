import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { admin as adminMiddleware } from '../middleware/roleMiddleware.js';
import {
  getUsers, updateUserStatus,
  createService, updateService, deleteService,
  getQueue, callNextQueue, skipQueue,
  getAppointments, updateAppointmentStatus,
  getStats
} from '../controllers/adminController.js';

const router = express.Router();

// Apply auth & admin middleware to all admin routes
router.use(protect, adminMiddleware);

router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);

router.post('/services', createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

router.get('/queue', getQueue);
router.post('/queue/next', callNextQueue);
router.post('/queue/skip', skipQueue);

router.get('/appointments', getAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);

router.get('/stats', getStats);

export default router;
