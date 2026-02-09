import { Router } from 'express';
import patientController, {
  createPatientValidation,
  updatePatientValidation,
} from '../controllers/patient.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { param } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', patientController.getAll.bind(patientController));
router.get('/:id', validate([param('id').isUUID()]), patientController.getById.bind(patientController));
router.post('/', validate(createPatientValidation), authorizeRoles('admin', 'nurse', 'psychologist'), patientController.create.bind(patientController));
router.put('/:id', validate(updatePatientValidation), authorizeRoles('admin', 'nurse', 'psychologist'), patientController.update.bind(patientController));
router.delete('/:id', validate([param('id').isUUID()]), authorizeRoles('admin'), patientController.delete.bind(patientController));

export default router;
