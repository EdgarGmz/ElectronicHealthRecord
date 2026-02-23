import { Router } from 'express';
import patientController, {
  createPatientValidation,
  updatePatientValidation,
} from '../controllers/patient.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { param } from 'express-validator';
import { ROLES_CAN_MANAGE_PATIENTS, ROLES_CAN_DELETE_PATIENTS } from '../constants/roles';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Búsqueda por matrícula o número de empleado (antes de /:id para no interpretar "by-enrollment" como UUID)
router.get(
  '/by-enrollment/:number',
  validate([param('number').notEmpty().withMessage('Matrícula o número de empleado es requerido')]),
  patientController.getByEnrollmentOrEmployee.bind(patientController)
);
// Admin solo puede ver; crear/editar/eliminar solo el resto del personal
router.get('/', patientController.getAll.bind(patientController));
router.get('/:id', validate([param('id').isUUID()]), patientController.getById.bind(patientController));
router.post('/', validate(createPatientValidation), authorizeRoles(...ROLES_CAN_MANAGE_PATIENTS), patientController.create.bind(patientController));
router.put('/:id', validate(updatePatientValidation), authorizeRoles(...ROLES_CAN_MANAGE_PATIENTS), patientController.update.bind(patientController));
router.delete('/:id', validate([param('id').isUUID()]), authorizeRoles(...ROLES_CAN_DELETE_PATIENTS), patientController.delete.bind(patientController));

export default router;
