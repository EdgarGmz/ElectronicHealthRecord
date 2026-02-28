import { Router } from 'express';
import * as psychometricTestController from '../controllers/psychometric-test.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { param } from 'express-validator';
import { ROLES_PSICOMETRIA, ROLES_CAN_DELETE_PSICOMETRIA } from '../constants/roles';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all psychometric evaluations - all authenticated users can list (filtered by service)
router.get('/', psychometricTestController.getPsychometricTests);

// Get specific psychometric evaluation - all authenticated users can view (filtered by service)
router.get(
  '/:id',
  validate([param('id').isUUID()]),
  psychometricTestController.getPsychometricTestById
);

// Create psychometric evaluation - psicólogo y coordinadores de psicología
router.post(
  '/',
  authorizeRoles(...ROLES_PSICOMETRIA),
  validate(psychometricTestController.createPsychometricTestValidation),
  psychometricTestController.createPsychometricTest
);

// Update psychometric evaluation
router.put(
  '/:id',
  authorizeRoles(...ROLES_PSICOMETRIA),
  validate(psychometricTestController.updatePsychometricTestValidation),
  psychometricTestController.updatePsychometricTest
);

// Delete psychometric evaluation - solo admin y coordinador de psicología
router.delete(
  '/:id',
  authorizeRoles(...ROLES_CAN_DELETE_PSICOMETRIA),
  validate([param('id').isUUID()]),
  psychometricTestController.deletePsychometricTest
);

export default router;
