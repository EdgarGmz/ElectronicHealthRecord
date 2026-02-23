import { Router } from 'express';
import * as therapySessionController from '../controllers/therapy-session.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { ROLES_THERAPY_SESSIONS, ROLES_THERAPY_SESSIONS_READ } from '../constants/roles';

const router = Router();

router.use(authenticateToken);

// Listar y ver: coordinador psicología, psicólogo y coordinador enfermería (acceso restringido/lectura).
router.get('/', authorizeRoles(...ROLES_THERAPY_SESSIONS_READ), therapySessionController.getTherapySessions);
router.get(
  '/:id',
  authorizeRoles(...ROLES_THERAPY_SESSIONS_READ),
  validate(therapySessionController.getTherapySessionByIdValidation),
  therapySessionController.getTherapySessionById
);

// Crear/editar: solo coordinador psicología y psicólogo (coordinador enfermería no).
router.post(
  '/',
  authorizeRoles(...ROLES_THERAPY_SESSIONS),
  validate(therapySessionController.createTherapySessionValidation),
  therapySessionController.createTherapySession
);
router.put(
  '/:id',
  authorizeRoles(...ROLES_THERAPY_SESSIONS),
  validate(therapySessionController.updateTherapySessionValidation),
  therapySessionController.updateTherapySession
);

export default router;
