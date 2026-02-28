import { Router } from 'express';
import * as medicationController from '../controllers/medication.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { ROLES_CAN_MANAGE_MEDICATIONS, ROLES_CAN_CREATE_MEDICATION } from '../constants/roles';

const router = Router();

// Todas las rutas requieren autenticación. Admin solo puede ver inventario; crear/editar solo enfermero.
router.use(authenticateToken);

// Inventario de medicamentos (catálogo) — rutas relativas al mount /medications
router.get('/', medicationController.getMedications);
router.get('/:id', medicationController.getMedicationById);

router.post(
  '/',
  authorizeRoles(...ROLES_CAN_CREATE_MEDICATION),
  validate(medicationController.createMedicationValidation),
  medicationController.createMedication
);

router.put(
  '/:id',
  authorizeRoles(...ROLES_CAN_MANAGE_MEDICATIONS),
  validate(medicationController.updateMedicationValidation),
  medicationController.updateMedication
);

// Prescripciones eliminadas del sistema (la universidad no puede prescribir)

export default router;
