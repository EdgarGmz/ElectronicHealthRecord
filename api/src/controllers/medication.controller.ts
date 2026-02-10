import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import medicationService from '../services/medication.service';
import { AuthRequest } from '../middleware/auth';
import { PRESCRIPTION_STATUS_VALUES, parseBooleanQuery } from '../utils/constants';

// Validation rules
export const createMedicationValidation = [
  body('name').notEmpty().trim().withMessage('Medication name is required'),
  body('genericName').notEmpty().trim().withMessage('Generic name is required'),
  body('category').optional().trim(),
  body('dosageForms').optional().trim(),
  body('commonDosages').optional().trim(),
  body('administrationRoutes').optional().trim(),
  body('contraindications').optional().trim(),
  body('sideEffects').optional().trim(),
];

export const updateMedicationValidation = [
  param('id').isUUID().withMessage('Invalid medication ID'),
  body('name').optional().notEmpty().trim().withMessage('Medication name cannot be empty'),
  body('genericName').optional().notEmpty().trim().withMessage('Generic name cannot be empty'),
  body('category').optional().trim(),
  body('dosageForms').optional().trim(),
  body('commonDosages').optional().trim(),
  body('administrationRoutes').optional().trim(),
  body('contraindications').optional().trim(),
  body('sideEffects').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

export const createPrescriptionValidation = [
  body('patientId').isUUID().withMessage('Valid patient ID is required'),
  body('medicationId').isUUID().withMessage('Valid medication ID is required'),
  body('dosage').notEmpty().trim().withMessage('Dosage is required'),
  body('frequency').notEmpty().trim().withMessage('Frequency is required'),
  body('route').notEmpty().trim().withMessage('Route is required'),
  body('duration').optional().trim(),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date required'),
  body('instructions').optional().trim(),
];

export const updatePrescriptionStatusValidation = [
  param('id').isUUID().withMessage('Invalid prescription ID'),
  body('status')
    .isIn(PRESCRIPTION_STATUS_VALUES)
    .withMessage('Invalid status'),
];

export const createPrescriptionAdministrationValidation = [
  param('id').isUUID().withMessage('Invalid prescription ID'),
  body('nursingConsultationId').isUUID().withMessage('Valid nursing consultation ID is required'),
  body('administrationDate').isISO8601().withMessage('Valid administration date is required'),
  body('patientVerified').isBoolean().withMessage('Patient verified must be a boolean'),
  body('medicationVerified').isBoolean().withMessage('Medication verified must be a boolean'),
  body('dosageVerified').isBoolean().withMessage('Dosage verified must be a boolean'),
  body('routeVerified').isBoolean().withMessage('Route verified must be a boolean'),
  body('timeVerified').isBoolean().withMessage('Time verified must be a boolean'),
  body('adverseReaction').optional().trim(),
  body('observations').optional().trim(),
];

// Helper function to handle validation errors
const handleValidationErrors = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
    return true;
  }
  return false;
};

// Medication handlers
export const getMedications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const isActive = parseBooleanQuery(req.query.isActive);

    const result = await medicationService.getAllMedications(page, limit, search, category, isActive);

    res.status(200).json({
      success: true,
      message: 'Medications retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMedicationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const medication = await medicationService.getMedicationById(id);

    res.status(200).json({
      success: true,
      message: 'Medication retrieved successfully',
      data: medication,
    });
  } catch (error) {
    next(error);
  }
};

export const createMedication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (handleValidationErrors(req, res)) return;

    const medication = await medicationService.createMedication(req.body);

    res.status(201).json({
      success: true,
      message: 'Medication created successfully',
      data: medication,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMedication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { id } = req.params;
    const medication = await medicationService.updateMedication(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Medication updated successfully',
      data: medication,
    });
  } catch (error) {
    next(error);
  }
};

// Prescription handlers
export const getPrescriptions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const patientId = req.query.patientId as string;
    const prescribedBy = req.query.prescribedBy as string;
    const status = req.query.status as string;

    const result = await medicationService.getAllPrescriptions(page, limit, patientId, prescribedBy, status);

    res.status(200).json({
      success: true,
      message: 'Prescriptions retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPrescriptionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const prescription = await medicationService.getPrescriptionById(id);

    res.status(200).json({
      success: true,
      message: 'Prescription retrieved successfully',
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

export const createPrescription = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (handleValidationErrors(req, res)) return;

    // Use authenticated user as prescriber if not provided
    const prescribedBy = req.body.prescribedBy || req.user?.userId;

    if (!prescribedBy) {
      res.status(401).json({
        success: false,
        message: 'Prescriber ID is required',
      });
      return;
    }

    const prescriptionData = {
      ...req.body,
      prescribedBy,
      startDate: new Date(req.body.startDate),
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
    };

    const prescription = await medicationService.createPrescription(prescriptionData);

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePrescriptionStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (handleValidationErrors(req, res)) return;

    const { id } = req.params;
    const { status } = req.body;

    const prescription = await medicationService.updatePrescriptionStatus(id, status);

    res.status(200).json({
      success: true,
      message: 'Prescription status updated successfully',
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

export const createPrescriptionAdministration = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (handleValidationErrors(req, res)) return;

    const prescriptionId = req.params.id;
    const administeredBy = req.user?.userId;

    if (!administeredBy) {
      res.status(401).json({
        success: false,
        message: 'Administered by user ID is required',
      });
      return;
    }

    const administrationData = {
      prescriptionId,
      nursingConsultationId: req.body.nursingConsultationId,
      administeredBy,
      administrationDate: new Date(req.body.administrationDate),
      patientVerified: req.body.patientVerified,
      medicationVerified: req.body.medicationVerified,
      dosageVerified: req.body.dosageVerified,
      routeVerified: req.body.routeVerified,
      timeVerified: req.body.timeVerified,
      adverseReaction: req.body.adverseReaction,
      observations: req.body.observations,
    };

    const result = await medicationService.createPrescriptionAdministration(administrationData);

    res.status(201).json({
      success: true,
      message: 'Medication administration recorded successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
