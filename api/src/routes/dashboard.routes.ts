import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { ROLES } from '../constants/roles';

const router = Router();

router.use(authenticateToken);
router.get(
  '/chart-data',
  authorizeRoles(ROLES.ADMIN, ROLES.COORDINADOR_ENFERMERIA),
  dashboardController.dashboardChartValidation,
  dashboardController.getChartData
);
router.get(
  '/coordinator-psychology',
  authorizeRoles(ROLES.COORDINADOR_PSICOLOGIA),
  dashboardController.getCoordinatorPsychology
);

export default router;
