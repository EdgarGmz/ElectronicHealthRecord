import { Router } from 'express';
import * as medicationController from '../controllers/medication.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  ROLES_CAN_ACCESS_MEDICATIONS,
  ROLES_CAN_MANAGE_MEDICATIONS,
  ROLES_CAN_CREATE_MEDICATION,
} from '../constants/roles';

const router = Router();

// Todas las rutas requieren autenticación. Coord. psicología no tiene acceso al módulo.
router.use(authenticateToken);

// Inventario de medicamentos (catálogo) — rutas relativas al mount /medications
router.get('/', authorizeRoles(...ROLES_CAN_ACCESS_MEDICATIONS), medicationController.getMedications);
router.get('/:id/consumption', authorizeRoles(...ROLES_CAN_ACCESS_MEDICATIONS), medicationController.getMedicationConsumption);
router.get('/:id', authorizeRoles(...ROLES_CAN_ACCESS_MEDICATIONS), medicationController.getMedicationById);

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
