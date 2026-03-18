import { Router } from 'express';
import * as interconsultationController from '../controllers/interconsultation.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { query } from 'express-validator';
import { ROLES_INTERCONSULTA } from '../constants/roles';
import { DEPARTMENT_VALUES } from '../constants/interconsultation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', interconsultationController.getInterconsultations);

// Contador de interconsultas pendientes (para indicadores/alertas)
router.get('/pending-count', interconsultationController.getPendingInterconsultationsCount);

router.get('/:id', interconsultationController.getInterconsultationById);

// Professionals filtered by destination department
router.get(
  '/professionals',
  authorizeRoles(...ROLES_INTERCONSULTA),
  validate([
    query('toDepartment')
      .isIn(DEPARTMENT_VALUES)
      .withMessage('Valid toDepartment is required'),
  ]),
  interconsultationController.getInterconsultationProfessionals
);

router.post(
  '/',
  validate(interconsultationController.createInterconsultationValidation),
  interconsultationController.createInterconsultation
);
router.post(
  '/:id/response',
  validate(interconsultationController.respondToInterconsultationValidation),
  interconsultationController.respondToInterconsultation
);

export default router;
