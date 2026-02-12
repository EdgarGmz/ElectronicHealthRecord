import { Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { AuthRequest } from '../middleware/auth';

export const createTherapySessionValidation = [
  body('psychologyRecordId').isUUID().withMessage('Valid psychology record ID is required'),
  body('sessionNumber').isInt({ min: 1 }).withMessage('Session number must be a positive integer'),
  body('sessionDate').isISO8601().withMessage('Valid session date is required'),
  body('sessionDuration').optional().isInt({ min: 1 }).withMessage('Session duration must be a positive integer'),
  body('mood')
    .notEmpty().withMessage('Mood is required')
    .isLength({ max: 30 }).withMessage('Mood must be at most 30 characters'),
  body('evolutionNotes').optional().isString(),
  body('patientProgress').optional().isString(),
  body('assignedTasks').optional().isString(),
  body('observations').optional().isString(),
  body('nextSessionPlan').optional().isString(),
];

export const updateTherapySessionValidation = [
  param('id').isUUID().withMessage('Invalid therapy session ID'),
  body('sessionDate').optional().isISO8601().withMessage('Valid session date is required'),
  body('sessionDuration').optional().isInt({ min: 1 }).withMessage('Session duration must be a positive integer'),
  body('mood').optional()
    .isLength({ min: 1, max: 30 }).withMessage('Mood must be between 1 and 30 characters'),
  body('evolutionNotes').optional().isString(),
  body('patientProgress').optional().isString(),
  body('assignedTasks').optional().isString(),
  body('observations').optional().isString(),
  body('nextSessionPlan').optional().isString(),
];

export const getTherapySessionByIdValidation = [
  param('id').isUUID().withMessage('Invalid therapy session ID'),
];

export const getTherapySessions = (_req: Request, res: Response, _next: NextFunction): void => {
  res.status(200).json({ success: true, message: 'Therapy sessions list (not implemented)' });
};

export const createTherapySession = (_req: AuthRequest, res: Response, _next: NextFunction): void => {
  res.status(201).json({ success: true, message: 'Therapy session created (not implemented)' });
};

export const getTherapySessionById = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(200).json({ success: true, message: `Therapy session with id ${req.params.id} (not implemented)` });
};

export const updateTherapySession = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(200).json({ success: true, message: `Therapy session with id ${req.params.id} updated (not implemented)` });
};
