import { Router } from 'express';
import * as interconsultationController from '../controllers/interconsultation.controller';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', interconsultationController.getInterconsultations);
router.get('/:id', interconsultationController.getInterconsultationById);
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
