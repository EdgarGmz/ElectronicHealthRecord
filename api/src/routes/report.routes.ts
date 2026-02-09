import { Router } from 'express';
import * as reportController from '../controllers/report.controller';

const router = Router();

router.get('/statistics', reportController.getStatistics);
router.get('/consultations', reportController.getConsultationsReport);
router.get('/diagnoses', reportController.getDiagnosesReport);

export default router;
