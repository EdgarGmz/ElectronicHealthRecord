import { NextFunction, Response } from 'express';
import { body, param } from 'express-validator';
import appointmentService from '../services/appointment.service';
import { AuthRequest } from '../middleware/auth';
import { APPOINTMENT_STATUS_VALUES } from '../constants/appointment';

export const createAppointmentValidation = [
  body('patientId').isUUID().withMessage('Valid patient ID is required'),
  body('professionalId').isUUID().withMessage('Valid professional ID is required'),
  body('appointmentType').notEmpty().withMessage('Appointment type is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('durationMinutes').isInt({ min: 1, max: 90 }).withMessage('Valid duration in minutes is required (max 90)'),
  body('notes').optional().isString(),
];

export const updateAppointmentValidation = [
  param('id').isUUID().withMessage('Invalid appointment ID'),
  body('scheduledDate').optional().isISO8601().withMessage('Valid scheduled date is required'),
  body('durationMinutes').optional().isInt({ min: 1 }).withMessage('Valid duration in minutes is required'),
  body('status').optional().isIn(APPOINTMENT_STATUS_VALUES).withMessage('Invalid status'),
  body('rescheduleReason').optional().isString().withMessage('Reschedule reason must be a string'),
  body('notes').optional().isString(),
];

export const cancelAppointmentValidation = [
  param('id').isUUID().withMessage('Invalid appointment ID'),
  body('cancellationReason').notEmpty().withMessage('Cancellation reason is required'),
];

export const joinQueueValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('careerId').optional().isUUID().withMessage('Invalid career ID'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phone').optional().isString(),
  body('age').optional().isInt({ min: 1, max: 120 }).withMessage('Invalid age'),
  body('sex').optional().isString(),
  body('department').optional().isIn(['psicologia', 'enfermeria']).withMessage('Invalid department'),
  body('reason').optional().isString(),
];

export const getAppointments = async (
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

    const search = (req.query.search as string)?.trim();
    const filters: {
      patientId?: string;
      professionalId?: string;
      status?: string;
      department?: string;
      search?: string;
      startDate?: Date;
      endDate?: Date;
    } = {
      patientId: validateUUID(req.query.patientId as string),
      professionalId: validateUUID(req.query.professionalId as string),
      status: req.query.status as string,
      department: req.query.department as string,
      search: search || undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    };
    if (req.user.role === 'coordinador_enfermeria') {
      filters.department = 'nursing';
    }

    const result = await appointmentService.getAll(
      req.user.userId,
      req.user.role,
      page,
      limit,
      filters
    );

    res.status(200).json({
      success: true,
      message: 'Appointments retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentById = async (
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
    const appointment = await appointmentService.getById(
      id,
      req.user.userId,
      req.user.role
    );

    res.status(200).json({
      success: true,
      message: 'Appointment retrieved successfully',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (
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
      scheduledDate: new Date(req.body.scheduledDate),
      createdBy: req.user.userId,
    };

    const appointment = await appointmentService.create(data);

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAppointment = async (
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
    const data = {
      ...req.body,
      scheduledDate: req.body.scheduledDate ? new Date(req.body.scheduledDate) : undefined,
    };

    const appointment = await appointmentService.update(
      id,
      req.user.userId,
      req.user.role,
      data
    );

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelAppointment = async (
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
    const { cancellationReason } = req.body;

    const appointment = await appointmentService.cancel(
      id,
      req.user.userId,
      req.user.role,
      cancellationReason
    );

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentProfessionals = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const professionals = await appointmentService.getProfessionals();
    res.status(200).json({
      success: true,
      message: 'Professionals retrieved successfully',
      data: professionals,
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailability = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const professionalId = req.query.professionalId as string;
    const date = req.query.date ? new Date(req.query.date as string) : new Date();

    if (!professionalId) {
      res.status(400).json({
        success: false,
        message: 'Professional ID is required',
      });
      return;
    }

    const availability = await appointmentService.getAvailability(
      professionalId,
      date
    );

    res.status(200).json({
      success: true,
      message: 'Availability retrieved successfully',
      data: availability,
    });
  } catch (error) {
    next(error);
  }
};

export const getQueue = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const queue = await appointmentService.getQueue(req.user.userId, req.user.role);

    res.status(200).json({
      success: true,
      message: 'Fila virtual recuperada con éxito',
      data: queue,
    });
  } catch (error) {
    next(error);
  }
};

export const joinQueue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const queueEntry = await appointmentService.joinQueue(req.body);

    res.status(201).json({
      success: true,
      message: 'Te has registrado en la fila virtual con éxito',
      data: queueEntry,
    });
  } catch (error) {
    next(error);
  }
};
