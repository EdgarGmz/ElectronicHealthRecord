import { Router } from 'express';
import * as medicalRecordController from '../controllers/medical-record.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { param } from 'express-validator';
import { ROLES, ROLES_CAN_ACCESS_MEDICAL_RECORDS, ROLES_CAN_CREATE_MEDICAL_RECORD } from '../constants/roles';

const router = Router();

// All routes require authentication. Admin no tiene acceso a expedientes.
router.use(authenticateToken);

router.get('/', authorizeRoles(...ROLES_CAN_ACCESS_MEDICAL_RECORDS), medicalRecordController.getMedicalRecords);
router.get('/patient/:patientId', authorizeRoles(...ROLES_CAN_ACCESS_MEDICAL_RECORDS), validate(medicalRecordController.getByPatientIdValidation), medicalRecordController.getMedicalRecordByPatientId);
router.post('/ensure-for-patient', authorizeRoles(...ROLES_CAN_CREATE_MEDICAL_RECORD), validate(medicalRecordController.ensureExpedientValidation), medicalRecordController.ensureExpedientForPatient);
router.post('/', authorizeRoles(...ROLES_CAN_CREATE_MEDICAL_RECORD), validate(medicalRecordController.createMedicalRecordValidation), medicalRecordController.createMedicalRecord);
router.get('/:id', authorizeRoles(...ROLES_CAN_ACCESS_MEDICAL_RECORDS), validate([param('id').isUUID()]), medicalRecordController.getMedicalRecordById);
router.put('/:id', authorizeRoles(...ROLES_CAN_ACCESS_MEDICAL_RECORDS), validate(medicalRecordController.updateMedicalRecordValidation), medicalRecordController.updateMedicalRecord);
router.post('/:id/diagnoses', authorizeRoles(ROLES.PSICOLOGO), validate([param('id').isUUID()]), medicalRecordController.addDiagnosis);

export default router;
