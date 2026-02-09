import { Router } from 'express';
import * as medicationController from '../controllers/medication.controller';

const router = Router();

// Medication routes
router.get('/medications', medicationController.getMedications);
router.post('/medications', medicationController.createMedication);

// Prescription routes
router.get('/prescriptions', medicationController.getPrescriptions);
router.post('/prescriptions', medicationController.createPrescription);
router.post('/prescriptions/:id/administrations', medicationController.createPrescriptionAdministration);

export default router;
