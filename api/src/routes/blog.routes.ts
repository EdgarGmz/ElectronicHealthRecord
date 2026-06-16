import { Router } from 'express';
import blogController from '../controllers/blog.controller';

const router = Router();

// Rutas públicas
router.get('/', blogController.getAll);
router.get('/:id', blogController.getById);
router.post('/:id/like', blogController.like);

// Rutas protegidas por contraseña maestra (la validación se realiza dentro del controlador)
router.post('/', blogController.create);
router.put('/:id', blogController.update);
router.delete('/:id', blogController.delete);

export default router;
