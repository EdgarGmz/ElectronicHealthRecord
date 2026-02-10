import { Router } from 'express';
import * as medicalRecordController from '../controllers/medical-record.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { param } from 'express-validator';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', medicalRecordController.getMedicalRecords);
router.post('/', validate(medicalRecordController.createMedicalRecordValidation), authorizeRoles('admin', 'nurse', 'psychologist'), medicalRecordController.createMedicalRecord);
router.get('/:id', validate([param('id').isUUID()]), medicalRecordController.getMedicalRecordById);
router.put('/:id', validate(medicalRecordController.updateMedicalRecordValidation), authorizeRoles('admin', 'nurse', 'psychologist'), medicalRecordController.updateMedicalRecord);
router.post('/:id/diagnoses', validate([param('id').isUUID()]), authorizeRoles('psychologist'), medicalRecordController.addDiagnosis);

export default router;
