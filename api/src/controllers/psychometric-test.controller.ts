import { NextFunction, Response } from 'express';
import { body, param } from 'express-validator';
import psychometricTestService from '../services/psychometric-test.service';
import { AuthRequest } from '../middleware/auth';

export const createPsychometricTestValidation = [
  body('psychologyRecordId').isUUID().withMessage('Valid psychology record ID is required'),
  body('evaluationType').notEmpty().withMessage('Evaluation type is required'),
  body('applicationDate').isISO8601().withMessage('Valid application date is required'),
  body('rawScore').optional().isDecimal().withMessage('Raw score must be a decimal number'),
  body('standardScore').optional().isDecimal().withMessage('Standard score must be a decimal number'),
  body('percentile').optional().isInt({ min: 0, max: 100 }).withMessage('Percentile must be between 0 and 100'),
  body('interpretation').optional().isString(),
  body('fileUrl').optional().isString().isLength({ max: 500 }).withMessage('File URL must be a string up to 500 characters'),
];

export const updatePsychometricTestValidation = [
  param('id').isUUID().withMessage('Invalid psychometric evaluation ID'),
  body('evaluationType').optional().notEmpty().withMessage('Evaluation type cannot be empty'),
  body('applicationDate').optional().isISO8601().withMessage('Valid application date is required'),
  body('rawScore').optional().isDecimal().withMessage('Raw score must be a decimal number'),
  body('standardScore').optional().isDecimal().withMessage('Standard score must be a decimal number'),
  body('percentile').optional().isInt({ min: 0, max: 100 }).withMessage('Percentile must be between 0 and 100'),
  body('interpretation').optional().isString(),
  body('fileUrl').optional().isString().isLength({ max: 500 }).withMessage('File URL must be a string up to 500 characters'),
];

export const getPsychometricTests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Validate UUID format if provided to prevent potential issues
    // Note: Query parameters are safe here because:
    // 1. Prisma ORM protects against SQL injection
    // 2. UUIDs are validated with regex
    // 3. Service layer enforces role-based access control
    const validateUUID = (value: string | undefined): string | undefined => {
      if (!value) return undefined;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(value) ? value : undefined;
    };

    const filters = {
      psychologyRecordId: validateUUID(req.query.psychologyRecordId as string),
      evaluationType: req.query.evaluationType as string,
      administeredBy: validateUUID(req.query.administeredBy as string),
      applicationDateFrom: req.query.applicationDateFrom
        ? new Date(req.query.applicationDateFrom as string)
        : undefined,
      applicationDateTo: req.query.applicationDateTo
        ? new Date(req.query.applicationDateTo as string)
        : undefined,
    };

    const result = await psychometricTestService.getAll(
      req.user.userId,
      req.user.role,
      page,
      limit,
      filters
    );

    res.status(200).json({
      success: true,
      message: 'Psychometric evaluations retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPsychometricTestById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const evaluation = await psychometricTestService.getById(
      id,
      req.user.userId,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Psychometric evaluation retrieved successfully',
      data: evaluation,
    });
  } catch (error) {
    next(error);
  }
};

export const createPsychometricTest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const parseDecimal = (value: string | undefined): number | undefined => {
      if (!value) return undefined;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? undefined : parsed;
    };

    const parseInteger = (value: string | undefined): number | undefined => {
      if (!value) return undefined;
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? undefined : parsed;
    };

    const data = {
      psychologyRecordId: req.body.psychologyRecordId,
      evaluationType: req.body.evaluationType,
      applicationDate: new Date(req.body.applicationDate),
      rawScore: parseDecimal(req.body.rawScore),
      standardScore: parseDecimal(req.body.standardScore),
      percentile: parseInteger(req.body.percentile),
      interpretation: req.body.interpretation,
      administeredBy: req.user.userId,
      fileUrl: req.body.fileUrl,
    };

    const evaluation = await psychometricTestService.create(data);

    res.status(201).json({
      success: true,
      message: 'Psychometric evaluation created successfully',
      data: evaluation,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePsychometricTest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    const parseDecimal = (value: string | undefined): number | undefined => {
      if (!value) return undefined;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? undefined : parsed;
    };

    const parseInteger = (value: string | undefined): number | undefined => {
      if (!value) return undefined;
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? undefined : parsed;
    };

    const data = {
      evaluationType: req.body.evaluationType,
      applicationDate: req.body.applicationDate ? new Date(req.body.applicationDate) : undefined,
      rawScore: parseDecimal(req.body.rawScore),
      standardScore: parseDecimal(req.body.standardScore),
      percentile: parseInteger(req.body.percentile),
      interpretation: req.body.interpretation,
      fileUrl: req.body.fileUrl,
    };

    const evaluation = await psychometricTestService.update(
      id,
      req.user.userId,
      req.user.role,
      data
    );

    res.status(200).json({
      success: true,
      message: 'Psychometric evaluation updated successfully',
      data: evaluation,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePsychometricTest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const result = await psychometricTestService.delete(
      id,
      req.user.userId,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
