import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { ROLES } from '../constants/roles';

const router = Router();

router.use(authenticateToken);
router.get(
  '/chart-data',
  authorizeRoles(ROLES.ADMIN, ROLES.COORDINADOR_ENFERMERIA, ROLES.ENFERMERO),
  dashboardController.dashboardChartValidation,
  dashboardController.getChartData
);

router.get(
  '/nursing-kpis',
  authorizeRoles(ROLES.COORDINADOR_ENFERMERIA, ROLES.ENFERMERO),
  dashboardController.getNursingKpis
);

router.get(
  '/nursing-patients-series',
  authorizeRoles(ROLES.COORDINADOR_ENFERMERIA, ROLES.ENFERMERO),
  dashboardController.nursingPatientsSeriesValidation,
  dashboardController.getNursingPatientsSeries
);
router.get(
  '/nursing-staff-progress',
  authorizeRoles(ROLES.COORDINADOR_ENFERMERIA, ROLES.ENFERMERO),
  dashboardController.nursingStaffProgressValidation,
  dashboardController.getNursingStaffProgressHandler
);
router.get(
  '/medication-stock-summary',
  authorizeRoles(ROLES.COORDINADOR_ENFERMERIA, ROLES.ENFERMERO),
  dashboardController.getMedicationStockSummaryHandler
);
router.get(
  '/coordinator-psychology',
  authorizeRoles(ROLES.COORDINADOR_PSICOLOGIA),
  dashboardController.getCoordinatorPsychology
);

export default router;
