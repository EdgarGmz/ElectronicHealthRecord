import { Router } from 'express';
import * as medicalRecordController from '../controllers/medical-record.controller';

const router = Router();

router.get('/', medicalRecordController.getMedicalRecords);
router.post('/', medicalRecordController.createMedicalRecord);
router.get('/:id', medicalRecordController.getMedicalRecordById);
router.put('/:id', medicalRecordController.updateMedicalRecord);
router.post('/:id/diagnoses', medicalRecordController.addDiagnosis);

export default router;
