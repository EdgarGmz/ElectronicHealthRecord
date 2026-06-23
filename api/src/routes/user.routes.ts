import { Router } from 'express';
import userController, {
  createUserValidation,
  updateUserValidation,
  updateMeValidation,
  changePasswordValidation,
} from '../controllers/user.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { param } from 'express-validator';
import { ROLES, ROLES_USER_CRUD } from '../constants/roles';

const router = Router();

router.use(authenticateToken);

// Current user profile — any authenticated user
router.get('/me', userController.getMe.bind(userController));
router.put('/me', validate(updateMeValidation), userController.updateMe.bind(userController));
router.post('/change-password', validate(changePasswordValidation), userController.changePassword.bind(userController));
router.get('/me/careers', authorizeRoles(ROLES.PSICOLOGO), userController.getMeCareers.bind(userController));

// Solo admin: listar, ver, editar y eliminar usuarios. Coordinador de psicología solo puede crear usuarios (rol psicólogo).
router.get('/', authorizeRoles(...ROLES_USER_CRUD), userController.getAll.bind(userController));
router.get('/:id', authorizeRoles(...ROLES_USER_CRUD), validate([param('id').isUUID()]), userController.getById.bind(userController));
router.put('/:id', authorizeRoles(...ROLES_USER_CRUD), validate(updateUserValidation), userController.update.bind(userController));
router.delete('/:id', authorizeRoles(...ROLES_USER_CRUD), validate([param('id').isUUID()]), userController.delete.bind(userController));
router.delete('/:id/permanent', authorizeRoles(ROLES.ADMIN), validate([param('id').isUUID()]), userController.deletePermanently.bind(userController));

// Crear usuarios: solo admin
router.post(
  '/',
  authorizeRoles(ROLES.ADMIN),
  validate(createUserValidation),
  userController.create.bind(userController)
);

// Acciones adicionales de admin
router.post(
  '/:id/resend-confirmation',
  authorizeRoles(ROLES.ADMIN),
  validate([param('id').isUUID()]),
  userController.resendConfirmation.bind(userController)
);

router.post(
  '/:id/reset-password-admin',
  authorizeRoles(ROLES.ADMIN),
  validate([param('id').isUUID()]),
  userController.resetPasswordByAdmin.bind(userController)
);

export default router;
