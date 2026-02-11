import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Report generation endpoints with validation
router.get('/statistics', reportController.reportValidation, reportController.getStatistics);
router.get('/consultations', reportController.reportValidation, reportController.getConsultationsReport);
router.get('/diagnoses', reportController.reportValidation, reportController.getDiagnosesReport);

export default router;
