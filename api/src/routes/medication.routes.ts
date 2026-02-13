import { Router } from 'express';
import * as medicationController from '../controllers/medication.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Medication routes (catalog management)
router.get(
  '/medications',
  medicationController.getMedications
);

router.get(
  '/medications/:id',
  medicationController.getMedicationById
);

router.post(
  '/medications',
  authorizeRoles('admin', 'nurse'),
  validate(medicationController.createMedicationValidation),
  medicationController.createMedication
);

router.put(
  '/medications/:id',
  authorizeRoles('admin', 'nurse'),
  validate(medicationController.updateMedicationValidation),
  medicationController.updateMedication
);

// Prescription routes
router.get(
  '/prescriptions',
  medicationController.getPrescriptions
);

router.get(
  '/prescriptions/:id',
  medicationController.getPrescriptionById
);

router.post(
  '/prescriptions',
  authorizeRoles('doctor', 'psychologist', 'nurse'),
  validate(medicationController.createPrescriptionValidation),
  medicationController.createPrescription
);

router.put(
  '/prescriptions/:id/status',
  authorizeRoles('doctor', 'psychologist', 'nurse'),
  validate(medicationController.updatePrescriptionStatusValidation),
  medicationController.updatePrescriptionStatus
);

router.post(
  '/prescriptions/:id/administrations',
  authorizeRoles('nurse'),
  validate(medicationController.createPrescriptionAdministrationValidation),
  medicationController.createPrescriptionAdministration
);

export default router;
