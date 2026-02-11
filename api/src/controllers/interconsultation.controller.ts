import { NextFunction, Response } from 'express';
import { body, param } from 'express-validator';
import interconsultationService from '../services/interconsultation.service';
import { AuthRequest } from '../middleware/auth';
import {
  INTERCONSULTATION_URGENCY_VALUES,
  DEPARTMENT_VALUES,
} from '../constants/interconsultation';

export const createInterconsultationValidation = [
  body('patientId').isUUID().withMessage('Valid patient ID is required'),
  body('fromDepartment').isIn(DEPARTMENT_VALUES).withMessage('Valid from department is required'),
  body('toDepartment').isIn(DEPARTMENT_VALUES).withMessage('Valid to department is required'),
  body('fromProfessionalId').isUUID().withMessage('Valid from professional ID is required'),
  body('toProfessionalId').optional().isUUID().withMessage('Valid to professional ID is required'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('relevantInformation').optional().isString(),
  body('urgency').isIn(INTERCONSULTATION_URGENCY_VALUES).withMessage('Valid urgency level is required'),
];

export const respondToInterconsultationValidation = [
  param('id').isUUID().withMessage('Invalid interconsultation ID'),
  body('response').notEmpty().withMessage('Response is required'),
];

export const getInterconsultations = async (
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

    // Validate UUID format if provided
    const validateUUID = (value: string | undefined): string | undefined => {
      if (!value) return undefined;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(value) ? value : undefined;
    };

    const filters = {
      patientId: validateUUID(req.query.patientId as string),
      fromDepartment: req.query.fromDepartment as string,
      toDepartment: req.query.toDepartment as string,
      status: req.query.status as string,
      urgency: req.query.urgency as string,
      fromProfessionalId: validateUUID(req.query.fromProfessionalId as string),
      toProfessionalId: validateUUID(req.query.toProfessionalId as string),
    };

    const result = await interconsultationService.getAll(
      req.user.userId,
      req.user.role,
      page,
      limit,
      filters
    );

    res.status(200).json({
      success: true,
      message: 'Interconsultations retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getInterconsultationById = async (
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
    const interconsultation = await interconsultationService.getById(
      id,
      req.user.userId,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Interconsultation retrieved successfully',
      data: interconsultation,
    });
  } catch (error) {
    next(error);
  }
};

export const createInterconsultation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const data = {
      ...req.body,
      fromProfessionalId: req.body.fromProfessionalId || req.user.userId,
    };

    const interconsultation = await interconsultationService.create(data);

    res.status(201).json({
      success: true,
      message: 'Interconsultation created successfully',
      data: interconsultation,
    });
  } catch (error) {
    next(error);
  }
};

export const respondToInterconsultation = async (
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
    const { response } = req.body;

    const interconsultation = await interconsultationService.addResponse(
      id,
      req.user.userId,
      req.user.role,
      response
    );

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: interconsultation,
    });
  } catch (error) {
    next(error);
  }
};
