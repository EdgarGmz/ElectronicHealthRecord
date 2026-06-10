import { Router } from 'express';
import careerController, {
  createCareerValidation,
  updateCareerValidation,
} from '../controllers/career.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { param } from 'express-validator';
import { ROLES } from '../constants/roles';

const router = Router();

// Requerir autenticación para todas las rutas
router.use(authenticateToken);

// Obtener lista de carreras activas (cualquier usuario del personal autenticado)
router.get('/', careerController.getAll.bind(careerController));

// Rutas exclusivas para el Administrador (CRUD)
router.get(
  '/admin',
  authorizeRoles(ROLES.ADMIN),
  careerController.getAllAdmin.bind(careerController)
);

router.post(
  '/',
  authorizeRoles(ROLES.ADMIN),
  validate(createCareerValidation),
  careerController.create.bind(careerController)
);

router.put(
  '/:id',
  authorizeRoles(ROLES.ADMIN),
  validate([param('id').isUUID().withMessage('ID de carrera inválido')]),
  validate(updateCareerValidation),
  careerController.update.bind(careerController)
);

router.delete(
  '/:id',
  authorizeRoles(ROLES.ADMIN),
  validate([param('id').isUUID().withMessage('ID de carrera inválido')]),
  careerController.delete.bind(careerController)
);

export default router;
