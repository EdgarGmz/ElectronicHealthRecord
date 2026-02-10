import { Router } from 'express';
import * as appointmentController from '../controllers/appointment.controller';
import {
  createAppointmentValidation,
  updateAppointmentValidation,
  cancelAppointmentValidation,
} from '../controllers/appointment.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { param } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// List appointments - all authenticated users can list their own appointments
router.get('/', appointmentController.getAppointments);

// Check availability - all authenticated users can check availability
router.get('/availability', appointmentController.getAvailability);

// Get specific appointment - all authenticated users can view their own appointments
router.get(
  '/:id',
  validate([param('id').isUUID()]),
  appointmentController.getAppointmentById
);

// Create appointment - professionals, coordinators, and admins can create appointments
router.post(
  '/',
  authorizeRoles('admin', 'psychologist', 'nurse'),
  validate(createAppointmentValidation),
  appointmentController.createAppointment
);

// Update appointment - professionals can update their appointments, patients can update notes
router.put(
  '/:id',
  validate(updateAppointmentValidation),
  appointmentController.updateAppointment
);

// Cancel appointment - all authenticated users can cancel their appointments
router.delete(
  '/:id',
  validate(cancelAppointmentValidation),
  appointmentController.cancelAppointment
);

export default router;
