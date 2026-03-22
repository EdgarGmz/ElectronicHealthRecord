import { Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import nursingAttentionService from '../services/nursing-attention.service';
import type { AuthRequest } from '../middleware/auth';

export const createNursingAttentionValidation = [
  body('patientId').isUUID().withMessage('Valid patient ID is required'),
  body('motiveAtencion').notEmpty().trim().withMessage('Motivo de atención es requerido'),
  body('signosVitales').optional().isObject().withMessage('signosVitales must be an object'),
  body('diagnosticoRelampago').optional().isString(),
  body('tratamientoAplicado').optional().isString(),
  body('observaciones').optional().isString(),
  body('derivacion').optional().isString(),
];

export const getNursingAttentionByIdValidation = [
  param('id').isUUID().withMessage('Valid attention ID is required'),
];

export const getNursingAttentionById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role?.toLowerCase();
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id } = req.params;
    const isPsychology = userRole ? PSYCHOLOGY_ROLES.includes(userRole) : false;
    const attention = await nursingAttentionService.getById(id, userId, isPsychology);
    res.status(200).json({
      success: true,
      message: 'Nursing attention retrieved successfully',
      data: attention,
    });
  } catch (error) {
    next(error);
  }
};

const PSYCHOLOGY_ROLES = ['coordinador_psicologia', 'psicologo'];

export const listMyNursingAttentions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role?.toLowerCase();
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const dateFrom = typeof req.query.dateFrom === 'string' ? req.query.dateFrom : undefined;
    const dateTo = typeof req.query.dateTo === 'string' ? req.query.dateTo : undefined;
    const disposition = typeof req.query.disposition === 'string' ? req.query.disposition : undefined;
    const patientId = typeof req.query.patientId === 'string' ? req.query.patientId : undefined;
    const isPsychology = userRole ? PSYCHOLOGY_ROLES.includes(userRole) : false;
    const isCoordinator = userRole === 'coordinador_enfermeria';

    if (isPsychology && !patientId) {
      res.status(400).json({ success: false, message: 'patientId is required for psychology roles' });
      return;
    }

    const attentions = await nursingAttentionService.listForNurse(
      isPsychology ? '' : userId,
      { search, dateFrom, dateTo, disposition, patientId },
      isCoordinator || isPsychology
    );

    res.status(200).json({
      success: true,
      message: 'Nursing attentions retrieved successfully',
      data: { attentions },
    });
  } catch (error) {
    next(error);
  }
};

export const createNursingAttention = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const nurseId = req.user?.userId;
    if (!nurseId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const attention = await nursingAttentionService.create({
      patientId: req.body.patientId,
      nurseId,
      motiveAtencion: req.body.motiveAtencion,
      signosVitales: req.body.signosVitales,
      diagnosticoRelampago: req.body.diagnosticoRelampago,
      tratamientoAplicado: req.body.tratamientoAplicado,
      observaciones: req.body.observaciones,
      derivacion: req.body.derivacion,
    });

    res.status(201).json({
      success: true,
      message: 'Nursing attention created successfully',
      data: attention,
    });
  } catch (error) {
    next(error);
  }
};

