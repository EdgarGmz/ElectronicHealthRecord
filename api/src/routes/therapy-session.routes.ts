import { Router } from 'express';
import * as therapySessionController from '../controllers/therapy-session.controller';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', therapySessionController.getTherapySessions);
router.post(
  '/',
  validate(therapySessionController.createTherapySessionValidation),
  therapySessionController.createTherapySession
);
router.get(
  '/:id',
  validate(therapySessionController.getTherapySessionByIdValidation),
  therapySessionController.getTherapySessionById
);
router.put(
  '/:id',
  validate(therapySessionController.updateTherapySessionValidation),
  therapySessionController.updateTherapySession
);

export default router;
