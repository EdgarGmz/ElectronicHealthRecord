import { Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import medicalRecordService from '../services/medical-record.service';
import { AuthRequest } from '../middleware/auth';

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

    const result = await medicalRecordService.getAll(page, limit, search);

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

    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      data: medicalRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const getMedicalRecordById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const medicalRecord = await medicalRecordService.getById(id);

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

    const medicalRecord = await medicalRecordService.update(id, data);

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
