import { Router } from 'express';

// Import existing routes
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import patientRoutes from './patient.routes';
import healthRoutes from './health.routes';

// Import new routes
import medicalRecordRoutes from './medical-record.routes';
import appointmentRoutes from './appointment.routes';
import medicationRoutes from './medication.routes';
import therapySessionRoutes from './therapy-session.routes';
import psychometricTestRoutes from './psychometric-test.routes';
import interconsultationRoutes from './interconsultation.routes';
import reportRoutes from './report.routes';
import auditLogRoutes from './audit-log.routes';
import notificationRoutes from './notification.routes';

const router = Router();

// Health check endpoint
router.use('/health', healthRoutes);

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/patients', patientRoutes);

// Add new routes
router.use('/medical-records', medicalRecordRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/medications', medicationRoutes);
router.use('/prescriptions', medicationRoutes); // Assuming this is handled in medication.routes
router.use('/therapy-sessions', therapySessionRoutes);
router.use('/psychometric-tests', psychometricTestRoutes);
router.use('/interconsultations', interconsultationRoutes);
router.use('/reports', reportRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/notifications', notificationRoutes);

export default router;
