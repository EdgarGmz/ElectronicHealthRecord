import { Router } from 'express';
import * as appointmentController from '../controllers/appointment.controller';
import {
  createAppointmentValidation,
  updateAppointmentValidation,
  cancelAppointmentValidation,
  joinQueueValidation,
} from '../controllers/appointment.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { param } from 'express-validator';
import { ROLES_CAN_MANAGE_APPOINTMENTS, ROLES_CAN_CREATE_APPOINTMENT } from '../constants/roles';

const router = Router();

// Public route for Kiosk check-in (Waiting list)
router.post('/queue/join', validate(joinQueueValidation), appointmentController.joinQueue);

// All other routes require authentication. Admin solo puede ver citas; no crear/editar/cancelar.
router.use(authenticateToken);

router.get('/queue', appointmentController.getQueue);

router.get('/', appointmentController.getAppointments);
router.get('/professionals', appointmentController.getAppointmentProfessionals);
router.get('/availability', appointmentController.getAvailability);
router.get(
  '/:id',
  validate([param('id').isUUID()]),
  appointmentController.getAppointmentById
);

router.post(
  '/',
  authorizeRoles(...ROLES_CAN_CREATE_APPOINTMENT),
  validate(createAppointmentValidation),
  appointmentController.createAppointment
);

router.put(
  '/:id',
  authorizeRoles(...ROLES_CAN_MANAGE_APPOINTMENTS),
  validate(updateAppointmentValidation),
  appointmentController.updateAppointment
);

router.delete(
  '/:id',
  authorizeRoles(...ROLES_CAN_MANAGE_APPOINTMENTS),
  validate(cancelAppointmentValidation),
  appointmentController.cancelAppointment
);

export default router;
