import { Router } from 'express';
import userController, { createUserValidation, updateUserValidation, updateMeValidation } from '../controllers/user.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { param } from 'express-validator';
import { ROLES_USER_CRUD, ROLES_CAN_CREATE_PSYCHOLOGY_USER, ROLES_CAN_CREATE_NURSING_USER } from '../constants/roles';

const router = Router();

router.use(authenticateToken);

// Current user profile — any authenticated user
router.get('/me', userController.getMe.bind(userController));
router.put('/me', validate(updateMeValidation), userController.updateMe.bind(userController));

// Solo admin: listar, ver, editar y eliminar usuarios. Coordinador de psicología solo puede crear usuarios (rol psicólogo).
router.get('/', authorizeRoles(...ROLES_USER_CRUD), userController.getAll.bind(userController));
router.get('/:id', authorizeRoles(...ROLES_USER_CRUD), validate([param('id').isUUID()]), userController.getById.bind(userController));
router.put('/:id', authorizeRoles(...ROLES_USER_CRUD), validate(updateUserValidation), userController.update.bind(userController));
router.delete('/:id', authorizeRoles(...ROLES_USER_CRUD), validate([param('id').isUUID()]), userController.delete.bind(userController));

// Crear usuarios: admin; coordinador psicología (solo rol psicólogo); coordinador enfermería (solo rol enfermero).
router.post(
  '/',
  authorizeRoles(...ROLES_CAN_CREATE_PSYCHOLOGY_USER, ...ROLES_CAN_CREATE_NURSING_USER),
  validate(createUserValidation),
  userController.create.bind(userController)
);

export default router;
