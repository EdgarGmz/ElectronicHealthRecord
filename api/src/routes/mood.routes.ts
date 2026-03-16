import { Router } from 'express';
import moodController from '../controllers/mood.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', moodController.getAll.bind(moodController));

export default router;
