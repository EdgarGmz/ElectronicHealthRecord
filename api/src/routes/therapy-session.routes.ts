import { Router } from 'express';
import * as therapySessionController from '../controllers/therapy-session.controller';

const router = Router();

router.get('/', therapySessionController.getTherapySessions);
router.post('/', therapySessionController.createTherapySession);
router.get('/:id', therapySessionController.getTherapySessionById);
router.put('/:id', therapySessionController.updateTherapySession);

export default router;
