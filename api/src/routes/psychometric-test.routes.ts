import { Router } from 'express';
import * as psychometricTestController from '../controllers/psychometric-test.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { param } from 'express-validator';

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

// Create psychometric evaluation - only psychologists and coordinators can create
router.post(
  '/',
  authorizeRoles('psychologist', 'coordinador_psicologia', 'admin'),
  validate(psychometricTestController.createPsychometricTestValidation),
  psychometricTestController.createPsychometricTest
);

// Update psychometric evaluation - only psychologists and coordinators can update
router.put(
  '/:id',
  authorizeRoles('psychologist', 'coordinador_psicologia', 'admin'),
  validate(psychometricTestController.updatePsychometricTestValidation),
  psychometricTestController.updatePsychometricTest
);

// Delete psychometric evaluation - only admins and coordinators can delete
router.delete(
  '/:id',
  authorizeRoles('admin', 'coordinador_psicologia'),
  validate([param('id').isUUID()]),
  psychometricTestController.deletePsychometricTest
);

export default router;
