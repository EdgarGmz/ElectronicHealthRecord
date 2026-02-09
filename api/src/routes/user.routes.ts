import { Router } from 'express';
import userController, { updateUserValidation } from '../controllers/user.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { param } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', userController.getAll.bind(userController));
router.get('/:id', validate([param('id').isUUID()]), userController.getById.bind(userController));
router.put('/:id', validate(updateUserValidation), userController.update.bind(userController));
router.delete('/:id', validate([param('id').isUUID()]), authorizeRoles('admin'), userController.delete.bind(userController));

export default router;
