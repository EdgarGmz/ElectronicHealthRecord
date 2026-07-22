import { Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import medicalRecordService from '../services/medical-record.service';
import { AuthRequest } from '../middleware/auth';
import { createAuditLog, AUDIT_ACTIONS, AUDIT_TABLES } from '../utils/audit';

export const createMedicalRecordValidation = [
  body('patientId').isUUID().withMessage('Valid patient ID is required'),
  body('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood type'),
  body('allergies').optional().isString().withMessage('Allergies must be a string'),
  body('chronicConditions').optional().isString().withMessage('Chronic conditions must be a string'),
  body('currentMedications').optional().isString().withMessage('Current medications must be a string'),
  body('familyHistory').optional().isString().withMessage('Family history must be a string'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
];

export const updateMedicalRecordValidation = [
  param('id').isUUID().withMessage('Invalid medical record ID'),
  body('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood type'),
  body('allergies').optional().isString().withMessage('Allergies must be a string'),
  body('chronicConditions').optional().isString().withMessage('Chronic conditions must be a string'),
  body('currentMedications').optional().isString().withMessage('Current medications must be a string'),
  body('familyHistory').optional().isString().withMessage('Family history must be a string'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
];

export const getMedicalRecords = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const result = await medicalRecordService.getAll(page, limit, search, req.user?.role, req.user?.userId);

    res.status(200).json({
      success: true,
      message: 'Medical records retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createMedicalRecord = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // req.user is guaranteed to be present due to authenticateToken middleware
    const data = {
      ...req.body,
      createdBy: req.user!.userId,
    };

    const medicalRecord = await medicalRecordService.create(data);

    if (req.user?.userId) {
      const record = medicalRecord as any;
      const patientName = `${record.patient?.user?.firstName || ''} ${record.patient?.user?.lastName || ''}`.trim() || 'un paciente';
      await createAuditLog({
        userId: req.user.userId,
        action: AUDIT_ACTIONS.CREATE,
        tableName: AUDIT_TABLES.MEDICAL_RECORD,
        recordId: medicalRecord.id,
        newValues: { patientName, bloodType: medicalRecord.bloodType },
        req,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      data: medicalRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const getByPatientIdValidation = [param('patientId').isUUID().withMessage('Valid patient ID is required')];

export const ensureExpedientValidation = [body('patientId').isUUID().withMessage('Valid patient ID is required')];

export const ensureExpedientForPatient = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { patientId } = req.body;
    if (!req.user?.userId || !req.user?.role) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const medicalRecord = await medicalRecordService.ensureExpedientForPatient(
      patientId,
      req.user.userId,
      req.user.role
    );

    const record = medicalRecord as any;
    const patientName = `${record.patient?.user?.firstName || ''} ${record.patient?.user?.lastName || ''}`.trim() || 'un paciente';
    await createAuditLog({
      userId: req.user.userId,
      action: AUDIT_ACTIONS.CREATE,
      tableName: AUDIT_TABLES.MEDICAL_RECORD,
      recordId: medicalRecord.id,
      newValues: { patientName, bloodType: medicalRecord.bloodType },
      req,
    });

    res.status(200).json({
      success: true,
      message: 'Medical record ready',
      data: medicalRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const getMedicalRecordByPatientId = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { patientId } = req.params;
    const medicalRecord = await medicalRecordService.getByPatientId(patientId, req.user?.role, req.user?.userId);

    if (req.user?.userId && medicalRecord) {
      const record = medicalRecord as any;
      const patientName = `${record.patient?.user?.firstName || ''} ${record.patient?.user?.lastName || ''}`.trim() || 'un paciente';
      await createAuditLog({
        userId: req.user.userId,
        action: AUDIT_ACTIONS.VIEW_RECORD,
        tableName: AUDIT_TABLES.MEDICAL_RECORD,
        recordId: medicalRecord.id,
        newValues: { patientName },
        req,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Medical record retrieved successfully',
      data: medicalRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const getMedicalRecordById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const medicalRecord = await medicalRecordService.getById(id, req.user?.role, req.user?.userId);

    if (req.user?.userId && medicalRecord) {
      const record = medicalRecord as any;
      const patientName = `${record.patient?.user?.firstName || ''} ${record.patient?.user?.lastName || ''}`.trim() || 'un paciente';
      await createAuditLog({
        userId: req.user.userId,
        action: AUDIT_ACTIONS.VIEW_RECORD,
        tableName: AUDIT_TABLES.MEDICAL_RECORD,
        recordId: medicalRecord.id,
        newValues: { patientName },
        req,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Medical record retrieved successfully',
      data: medicalRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMedicalRecord = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    // req.user is guaranteed to be present due to authenticateToken middleware
    const data = {
      ...req.body,
      updatedBy: req.user!.userId,
    };

    const medicalRecord = await medicalRecordService.update(id, data, req.user?.role);

    if (req.user?.userId) {
      const record = medicalRecord as any;
      const patientName = `${record.patient?.user?.firstName || ''} ${record.patient?.user?.lastName || ''}`.trim() || 'un paciente';
      await createAuditLog({
        userId: req.user.userId,
        action: AUDIT_ACTIONS.UPDATE,
        tableName: AUDIT_TABLES.MEDICAL_RECORD,
        recordId: medicalRecord.id,
        newValues: { ...req.body, patientName },
        req,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Medical record updated successfully',
      data: medicalRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const addDiagnosis = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // This endpoint is a placeholder for adding diagnoses
    // In the actual implementation, diagnoses are typically added through
    // the psychology record or nursing consultation modules
    res.status(501).json({
      success: false,
      message: 'This functionality is implemented through the psychology record module. Please use the psychology record endpoints to add diagnoses.',
    });
  } catch (error) {
    next(error);
  }
};
