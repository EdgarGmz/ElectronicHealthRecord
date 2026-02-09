import { Router } from 'express';
import * as interconsultationController from '../controllers/interconsultation.controller';

const router = Router();

router.get('/', interconsultationController.getInterconsultations);
router.post('/', interconsultationController.createInterconsultation);
router.post('/:id/response', interconsultationController.respondToInterconsultation);

export default router;
