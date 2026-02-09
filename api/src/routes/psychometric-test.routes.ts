import { Router } from 'express';
import * as psychometricTestController from '../controllers/psychometric-test.controller';

const router = Router();

router.get('/', psychometricTestController.getPsychometricTests);
router.post('/', psychometricTestController.createPsychometricTest);

export default router;
