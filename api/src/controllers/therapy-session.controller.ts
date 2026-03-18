import { Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import therapySessionService from '../services/therapy-session.service';

export const createTherapySessionValidation = [
  body('psychologyRecordId').isUUID().withMessage('Valid psychology record ID is required'),
  body('sessionNumber').isInt({ min: 1 }).withMessage('Session number must be a positive integer'),
  body('sessionDate').isISO8601().withMessage('Valid session date is required'),
  body('sessionDuration').optional().isInt({ min: 1 }).withMessage('Session duration must be a positive integer'),
  body('mood').custom((value) => {
    if (value == null || (Array.isArray(value) && value.length === 0)) {
      return Promise.reject(new Error('Mood is required'));
    }
    const str = Array.isArray(value)
      ? value.map((v) => String(v).trim()).filter(Boolean).join(',')
      : String(value).trim();
    if (!str) return Promise.reject(new Error('Mood is required'));
    if (str.length > 255) return Promise.reject(new Error('Mood must be at most 255 characters'));
    return true;
  }),
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
  body('mood').optional().custom((value) => {
    if (value == null || value === '') return true;
    const str = Array.isArray(value)
      ? value.map((v) => String(v).trim()).filter(Boolean).join(',')
      : String(value).trim();
    return str.length <= 255 || Promise.reject(new Error('Mood must be at most 255 characters'));
  }),
  body('evolutionNotes').optional().isString(),
  body('patientProgress').optional().isString(),
  body('assignedTasks').optional().isString(),
  body('observations').optional().isString(),
  body('nextSessionPlan').optional().isString(),
];

export const cancelTherapySessionValidation = [
  param('id').isUUID().withMessage('Invalid therapy session ID'),
  body('cancellationReason').notEmpty().withMessage('Cancellation reason is required').isString(),
];

export const rescheduleTherapySessionValidation = [
  param('id').isUUID().withMessage('Invalid therapy session ID'),
  body('sessionDate').notEmpty().isISO8601().withMessage('Valid new session date is required'),
  body('rescheduleReason').notEmpty().withMessage('Reschedule reason is required').isString(),
];

export const getTherapySessionByIdValidation = [
  param('id').isUUID().withMessage('Invalid therapy session ID'),
];

export const getTherapySessions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const patientId = req.query.patientId as string | undefined;
    const therapistId = req.query.therapistId as string | undefined;
    const psychologyRecordId = req.query.psychologyRecordId as string | undefined;
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;
    const search = req.query.search as string | undefined;
    const result = await therapySessionService.getAll(
      req.user.userId,
      req.user.role,
      page,
      limit,
      { patientId, therapistId, psychologyRecordId, dateFrom, dateTo, search }
    );
    res.status(200).json({
      success: true,
      message: 'Therapy sessions retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createTherapySession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const moodValue = Array.isArray(req.body.mood)
      ? req.body.mood.map((v: string) => String(v).trim()).filter(Boolean).join(',')
      : String(req.body.mood ?? '').trim();
    const session = await therapySessionService.create(
      {
        psychologyRecordId: req.body.psychologyRecordId,
        sessionNumber: req.body.sessionNumber,
        sessionDate: new Date(req.body.sessionDate),
        sessionDuration: req.body.sessionDuration,
        mood: moodValue,
        evolutionNotes: req.body.evolutionNotes,
        patientProgress: req.body.patientProgress,
        assignedTasks: req.body.assignedTasks,
        observations: req.body.observations,
        nextSessionPlan: req.body.nextSessionPlan,
      },
      req.user.userId,
      req.user.role
    );
    res.status(201).json({
      success: true,
      message: 'Therapy session created successfully',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

export const getTherapySessionById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id } = req.params;
    const session = await therapySessionService.getById(id, req.user.userId, req.user.role);
    res.status(200).json({
      success: true,
      message: 'Therapy session retrieved successfully',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTherapySession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id } = req.params;
    const moodValue = req.body.mood != null
      ? (Array.isArray(req.body.mood)
          ? req.body.mood.map((v: string) => String(v).trim()).filter(Boolean).join(',')
          : String(req.body.mood).trim())
      : undefined;
    const session = await therapySessionService.update(
      id,
      {
        sessionDate: req.body.sessionDate ? new Date(req.body.sessionDate) : undefined,
        sessionDuration: req.body.sessionDuration,
        mood: moodValue,
        evolutionNotes: req.body.evolutionNotes,
        patientProgress: req.body.patientProgress,
        assignedTasks: req.body.assignedTasks,
        observations: req.body.observations,
        nextSessionPlan: req.body.nextSessionPlan,
      },
      req.user.userId,
      req.user.role
    );
    res.status(200).json({
      success: true,
      message: 'Therapy session updated successfully',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelTherapySession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id } = req.params;
    const { cancellationReason } = req.body as { cancellationReason: string };
    const session = await therapySessionService.cancel(
      id,
      cancellationReason,
      req.user.userId,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Therapy session cancelled successfully',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

export const rescheduleTherapySession = async (
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
    const { sessionDate, rescheduleReason } = req.body as { sessionDate: string; rescheduleReason: string };
    const session = await therapySessionService.reschedule(
      id,
      new Date(sessionDate),
      rescheduleReason,
      req.user.userId,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Therapy session rescheduled successfully',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};
