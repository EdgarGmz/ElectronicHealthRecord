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

// Obtener lista de carreras activas (Público para Kiosko de Autoservicio)
router.get('/', careerController.getAll.bind(careerController));

// Requerir autenticación para el resto de las rutas administrativas y CRUD
router.use(authenticateToken);

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
