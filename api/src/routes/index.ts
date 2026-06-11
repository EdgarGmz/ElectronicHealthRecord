import { Router } from 'express';

// Import existing routes
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import patientRoutes from './patient.routes';
import healthRoutes from './health.routes';
import careerRoutes from './career.routes';

// Import new routes
import medicalRecordRoutes from './medical-record.routes';
import appointmentRoutes from './appointment.routes';
import medicationRoutes from './medication.routes';
import nursingProcedureRoutes from './nursing-procedure.routes';
import nursingAttentionRoutes from './nursing-attention.routes';
import therapySessionRoutes from './therapy-session.routes';
import moodRoutes from './mood.routes';
import psychometricTestRoutes from './psychometric-test.routes';
import interconsultationRoutes from './interconsultation.routes';
import reportRoutes from './report.routes';
import auditLogRoutes from './audit-log.routes';
import notificationRoutes from './notification.routes';
import dashboardRoutes from './dashboard.routes';
import coordinatorPsychologyRoutes from './coordinator-psychology.routes';
import blogRoutes from './blog.routes';

const router = Router();

// Health check endpoint
router.use('/health', healthRoutes);

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/patients', patientRoutes);
router.use('/careers', careerRoutes);

// Add new routes
router.use('/medical-records', medicalRecordRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/medications', medicationRoutes);
router.use('/nursing-procedures', nursingProcedureRoutes);
router.use('/nursing-attentions', nursingAttentionRoutes);
router.use('/therapy-sessions', therapySessionRoutes);
router.use('/moods', moodRoutes);
router.use('/psychometric-tests', psychometricTestRoutes);
router.use('/interconsultations', interconsultationRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/coordinator-psychology', coordinatorPsychologyRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/notifications', notificationRoutes);
router.use('/blogs', blogRoutes);

export default router;
