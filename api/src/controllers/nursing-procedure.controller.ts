import { Response, NextFunction } from 'express';
import { body } from 'express-validator';
import nursingProcedureService from '../services/nursing-procedure.service';
import { AuthRequest } from '../middleware/auth';
import { createAuditLog, AUDIT_ACTIONS } from '../utils/audit';

export const createProcedureValidation = [
  body('nursingConsultationId').isUUID().withMessage('Valid nursing consultation ID is required'),
  body('procedureType').notEmpty().trim().withMessage('Procedure type is required'),
  body('procedureDate').isISO8601().withMessage('Valid procedure date is required'),
  body('description').notEmpty().trim().withMessage('Description is required'),
  body('materialsUsed').optional().trim(),
  body('observations').optional().trim(),
];

export const createFromPatientValidation = [
  body('patientId').isUUID().withMessage('Valid patient ID is required'),
  body('procedureType').notEmpty().trim().withMessage('Procedure type is required'),
  body('procedureDate').isISO8601().withMessage('Valid procedure date is required'),
  body('description').notEmpty().trim().withMessage('Description is required'),
  body('materialsUsed').optional().trim(),
  body('observations').optional().trim(),
];

export const getProcedures = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const procedureType = req.query.procedureType as string;
    const patientId = req.query.patientId as string;
    const nursingConsultationId = req.query.nursingConsultationId as string;

    const result = await nursingProcedureService.getAll(
      page,
      limit,
      search,
      procedureType,
      patientId,
      nursingConsultationId,
      req.user?.role,
      req.user?.userId
    );

    res.status(200).json({
      success: true,
      message: 'Procedures retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getProcedureById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const procedure = await nursingProcedureService.getById(id, req.user?.role, req.user?.userId);

    res.status(200).json({
      success: true,
      message: 'Procedure retrieved successfully',
      data: procedure,
    });
  } catch (error) {
    next(error);
  }
};

export const createProcedure = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const performedBy = req.user?.userId;
    if (!performedBy) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const procedure = await nursingProcedureService.create({
      nursingConsultationId: req.body.nursingConsultationId,
      procedureType: req.body.procedureType,
      procedureDate: new Date(req.body.procedureDate),
      description: req.body.description,
      materialsUsed: req.body.materialsUsed,
      observations: req.body.observations,
      performedBy,
    });

    if (req.user?.userId) {
      await createAuditLog({
        userId: req.user.userId,
        action: AUDIT_ACTIONS.CREATE,
        tableName: 'nursing_procedures',
        recordId: procedure.id,
        newValues: { procedureType: procedure.procedureType, description: procedure.description },
        req,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Procedure created successfully',
      data: procedure,
    });
  } catch (error) {
    next(error);
  }
};

export const createProcedureFromPatient = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const performedBy = req.user?.userId;
    if (!performedBy) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const procedure = await nursingProcedureService.createFromPatient(
      req.body.patientId,
      performedBy,
      {
        procedureType: req.body.procedureType,
        procedureDate: new Date(req.body.procedureDate),
        description: req.body.description,
        materialsUsed: req.body.materialsUsed,
        observations: req.body.observations,
      }
    );

    if (req.user?.userId) {
      await createAuditLog({
        userId: req.user.userId,
        action: AUDIT_ACTIONS.CREATE,
        tableName: 'nursing_procedures',
        recordId: procedure.id,
        newValues: { procedureType: procedure.procedureType, description: procedure.description },
        req,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Procedure created successfully',
      data: procedure,
    });
  } catch (error) {
    next(error);
  }
};
