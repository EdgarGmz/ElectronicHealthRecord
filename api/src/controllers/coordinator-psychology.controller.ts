import { Request, Response, NextFunction } from 'express';
import { body, param, query } from 'express-validator';
import userService from '../services/user.service';
import psychologistCareerService from '../services/psychologist-career.service';
import { getStaffProgress, type StaffProgressPeriod } from '../services/coordinator-psychology-staff-progress.service';
import {
  getConsultationsOverTime,
  getWorkloadDistribution,
  type GroupBy,
} from '../services/coordinator-psychology-analytics.service';
import { AuthRequest } from '../middleware/auth';
import { ROLES } from '../constants/roles';
import { AppError } from '../middleware/errorHandler';

const ROLE_PSICOLOGO = ROLES.PSICOLOGO;

export const listPsychologistsValidation = [];
export const createPsychologistValidation = [
  body('email').isEmail().withMessage('Email válido requerido'),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('firstName').notEmpty().withMessage('Nombre requerido'),
  body('lastName').notEmpty().withMessage('Apellido requerido'),
  body('dateOfBirth').isISO8601().withMessage('Fecha de nacimiento válida requerida'),
  body('phone').optional().trim(),
  body('enrollmentNumber').optional().trim(),
];
export const updatePsychologistValidation = [
  param('id').isUUID().withMessage('ID de usuario inválido'),
  body('firstName').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
  body('lastName').optional().notEmpty().withMessage('El apellido no puede estar vacío'),
  body('phone').optional().trim(),
  body('dateOfBirth').optional().isISO8601().withMessage('Fecha de nacimiento inválida'),
  body('isActive').optional().isBoolean().withMessage('isActive debe ser booleano'),
];
export const deactivatePsychologistValidation = [param('id').isUUID().withMessage('ID de usuario inválido')];

export const staffProgressValidation = [
  query('period').optional().isIn(['week', 'month', 'year']).withMessage('period debe ser week, month o year'),
];

export const analyticsConsultationsValidation = [
  query('start').isISO8601().withMessage('start debe ser fecha ISO 8601'),
  query('end').isISO8601().withMessage('end debe ser fecha ISO 8601'),
  query('groupBy').optional().isIn(['day', 'week', 'month']).withMessage('groupBy debe ser day, week o month'),
  query('psychologistId').optional().isUUID().withMessage('psychologistId debe ser UUID'),
];

export const analyticsWorkloadValidation = [
  query('start').isISO8601().withMessage('start debe ser fecha ISO 8601'),
  query('end').isISO8601().withMessage('end debe ser fecha ISO 8601'),
];

export const getPsychologistCareersValidation = [param('id').isUUID().withMessage('ID de usuario inválido')];
export const setPsychologistCareersValidation = [
  param('id').isUUID().withMessage('ID de usuario inválido'),
  body('careerIds').isArray().withMessage('careerIds debe ser un arreglo'),
  body('careerIds.*').optional().isUUID().withMessage('Cada elemento de careerIds debe ser un UUID válido'),
];

export async function getPsychologists(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;
    const result = await userService.getAll(page, limit, search, ROLE_PSICOLOGO);
    const psychologistIds = result.users.map((u) => u.id);
    const careersByPsychologist = await psychologistCareerService.getCareersByPsychologistIds(psychologistIds);
    const usersWithCareers = result.users.map((u) => ({
      ...u,
      careers: careersByPsychologist[u.id] || [],
    }));
    res.status(200).json({
      success: true,
      message: 'Lista de psicólogos',
      data: {
        users: usersWithCareers,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createPsychologist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = {
      ...req.body,
      role: ROLE_PSICOLOGO,
      dateOfBirth: new Date(req.body.dateOfBirth),
    };
    const user = await userService.create(data);
    res.status(201).json({
      success: true,
      message: 'Psicólogo creado correctamente',
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePsychologist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const user = await userService.getById(id);
    if (user.role !== ROLE_PSICOLOGO) {
      throw new AppError('Solo puede editar usuarios con rol psicólogo', 403);
    }
    const body = { ...req.body };
    delete body.role;
    delete body.email;
    const data = {
      ...body,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
    };
    const updated = await userService.update(id, data);
    res.status(200).json({
      success: true,
      message: 'Psicólogo actualizado correctamente',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function deactivatePsychologist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const user = await userService.getById(id);
    if (user.role !== ROLE_PSICOLOGO) {
      throw new AppError('Solo puede desactivar usuarios con rol psicólogo', 403);
    }
    await userService.delete(id);
    res.status(200).json({
      success: true,
      message: 'Psicólogo desactivado correctamente',
    });
  } catch (error) {
    next(error);
  }
}

/** DELETE /psychologists/:id/permanent — Elimina permanentemente al psicólogo (y sus asignaciones de carreras). */
export async function deletePsychologistPermanently(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await userService.deletePermanently(id);
    res.status(200).json({
      success: true,
      message: 'Psicólogo eliminado permanentemente',
    });
  } catch (error) {
    next(error);
  }
}

/** GET /staff-progress?period=week|month|year — Métricas de progreso por psicólogo (pacientes atendidos, expedientes, sesiones, citas). */
export async function getStaffProgressHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const period = (req.query.period as StaffProgressPeriod) || 'month';
    const data = await getStaffProgress(period);
    res.status(200).json({
      success: true,
      message: 'Progreso del personal',
      data: { progress: data, period },
    });
  } catch (error) {
    next(error);
  }
}

/** GET /analytics/consultations-over-time?start=...&end=...&groupBy=day|week|month&psychologistId=optional */
export async function getConsultationsOverTimeHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const start = new Date(req.query.start as string);
    const end = new Date(req.query.end as string);
    const groupBy = (req.query.groupBy as GroupBy) || 'day';
    const psychologistId = req.query.psychologistId as string | undefined;
    if (end < start) {
      res.status(400).json({ success: false, message: 'end debe ser posterior a start' });
      return;
    }
    const data = await getConsultationsOverTime(start, end, groupBy, psychologistId);
    res.status(200).json({
      success: true,
      message: 'Consultas en el tiempo',
      data: { series: data },
    });
  } catch (error) {
    next(error);
  }
}

/** GET /analytics/workload-distribution?start=...&end=... */
export async function getWorkloadDistributionHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const start = new Date(req.query.start as string);
    const end = new Date(req.query.end as string);
    if (end < start) {
      res.status(400).json({ success: false, message: 'end debe ser posterior a start' });
      return;
    }
    const data = await getWorkloadDistribution(start, end);
    res.status(200).json({
      success: true,
      message: 'Distribución de carga',
      data: { workload: data },
    });
  } catch (error) {
    next(error);
  }
}

/** GET /careers-with-assignments — Todas las carreras con asignación (para modal; una carrera = un psicólogo). */
export async function getCareersWithAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const careers = await psychologistCareerService.getCareersWithAssignments();
    res.status(200).json({
      success: true,
      message: 'Carreras con asignación',
      data: { careers },
    });
  } catch (error) {
    next(error);
  }
}

/** GET /psychologists/:id/careers — Carreras asignadas al psicólogo. */
export async function getPsychologistCareers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const user = await userService.getById(id);
    if (user.role !== ROLE_PSICOLOGO) {
      throw new AppError('El usuario no es psicólogo', 400);
    }
    const careerIds = await psychologistCareerService.getAssignedCareerIds(id);
    res.status(200).json({
      success: true,
      message: 'Carreras asignadas',
      data: { careerIds },
    });
  } catch (error) {
    next(error);
  }
}

/** PUT /psychologists/:id/careers — Asignar/desvincular carreras (reemplaza la lista). */
export async function setPsychologistCareers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const user = await userService.getById(id);
    if (user.role !== ROLE_PSICOLOGO) {
      throw new AppError('Solo se pueden asignar carreras a usuarios con rol psicólogo', 400);
    }
    const careerIds = Array.isArray(req.body.careerIds) ? req.body.careerIds : [];
    const assigned = await psychologistCareerService.setAssignments(id, careerIds);
    res.status(200).json({
      success: true,
      message: 'Carreras actualizadas correctamente',
      data: { careerIds: assigned },
    });
  } catch (error) {
    next(error);
  }
}
