import { Router } from 'express';
import careerController from '../controllers/career.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', careerController.getAll.bind(careerController));

export default router;
