import { Router } from 'express';
import * as appointmentController from '../controllers/appointment.controller';

const router = Router();

router.get('/', appointmentController.getAppointments);
router.post('/', appointmentController.createAppointment);
router.get('/availability', appointmentController.getAvailability);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.cancelAppointment);

export default router;
