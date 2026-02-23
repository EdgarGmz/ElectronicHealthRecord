import { Router } from 'express';
import * as medicationController from '../controllers/medication.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { ROLES_CAN_MANAGE_MEDICATIONS, ROLES_CAN_CREATE_MEDICATION } from '../constants/roles';

const router = Router();

// Todas las rutas requieren autenticación. Admin solo puede ver inventario; crear/editar solo enfermero.
router.use(authenticateToken);

// Inventario de medicamentos (catálogo)
router.get('/medications', medicationController.getMedications);
router.get('/medications/:id', medicationController.getMedicationById);

router.post(
  '/medications',
  authorizeRoles(...ROLES_CAN_CREATE_MEDICATION),
  validate(medicationController.createMedicationValidation),
  medicationController.createMedication
);

router.put(
  '/medications/:id',
  authorizeRoles(...ROLES_CAN_MANAGE_MEDICATIONS),
  validate(medicationController.updateMedicationValidation),
  medicationController.updateMedication
);

// Prescripciones eliminadas del sistema (la universidad no puede prescribir)

export default router;
