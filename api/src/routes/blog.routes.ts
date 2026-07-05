import { Router } from 'express';
import blogController from '../controllers/blog.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { ROLES_CAN_MANAGE_BLOGS } from '../constants/roles';

const router = Router();

// Rutas públicas
router.get('/', blogController.getAll);
router.get('/:id', blogController.getById);
router.post('/:id/like', blogController.like);

// Rutas protegidas por token JWT y autorizadas por rol de psicología
router.post('/', authenticateToken, authorizeRoles(...ROLES_CAN_MANAGE_BLOGS), blogController.create);
router.put('/:id', authenticateToken, authorizeRoles(...ROLES_CAN_MANAGE_BLOGS), blogController.update);
router.delete('/:id', authenticateToken, authorizeRoles(...ROLES_CAN_MANAGE_BLOGS), blogController.delete);

export default router;
