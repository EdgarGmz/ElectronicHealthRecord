import { Request, Response, NextFunction } from 'express';
import { query, validationResult } from 'express-validator';
import reportService from '../services/report.service';
import { AuthRequest } from '../middleware/auth';
import psychologistCareerService from '../services/psychologist-career.service';

// Validation rules
export const reportValidation = [
  query('periodStart').isISO8601().withMessage('Valid start date is required (ISO 8601 format)'),
  query('periodEnd').isISO8601().withMessage('Valid end date is required (ISO 8601 format)'),
  query('department').optional().trim().isString().withMessage('Department must be a string'),
];

// Helper function to check for validation errors
const hasValidationErrors = (req: Request, res: Response): boolean => {
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

/**
 * Generate statistics report
 * GET /reports/statistics?periodStart=2024-01-01&periodEnd=2024-12-31&department=psychology
 */
export const getStatistics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (hasValidationErrors(req, res)) return;

    const generatedBy = req.user?.userId;
    if (!generatedBy) {
      res.status(401).json({
        success: false,
        message: 'User authentication required',
      });
      return;
    }

    const filters: {
      periodStart: Date;
      periodEnd: Date;
      department?: string;
      careerIds?: string[];
    } = {
      periodStart: new Date(req.query.periodStart as string),
      periodEnd: new Date(req.query.periodEnd as string),
      department: req.query.department as string | undefined,
    };
    if (req.user?.role === 'coordinador_psicologia') {
      filters.department = 'psychology';
    }
    if (req.user?.role === 'coordinador_enfermeria') {
      filters.department = 'nursing';
    }
    if (req.user?.role === 'psicologo' && req.user?.userId) {
      filters.department = 'psychology';
      filters.careerIds = await psychologistCareerService.getAssignedCareerIds(req.user.userId);
    }

    const result = await reportService.generateStatisticsReport(filters, generatedBy);

    res.status(200).json({
      success: true,
      message: 'Statistics report generated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate consultations (interconsultations) report
 * GET /reports/consultations?periodStart=2024-01-01&periodEnd=2024-12-31&department=psychology
 */
export const getConsultationsReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (hasValidationErrors(req, res)) return;

    const generatedBy = req.user?.userId;
    if (!generatedBy) {
      res.status(401).json({
        success: false,
        message: 'User authentication required',
      });
      return;
    }

    const filters: {
      periodStart: Date;
      periodEnd: Date;
      department?: string;
      careerIds?: string[];
    } = {
      periodStart: new Date(req.query.periodStart as string),
      periodEnd: new Date(req.query.periodEnd as string),
      department: req.query.department as string | undefined,
    };
    if (req.user?.role === 'coordinador_psicologia') {
      filters.department = 'psychology';
    }
    if (req.user?.role === 'coordinador_enfermeria') {
      filters.department = 'nursing';
    }
    if (req.user?.role === 'psicologo' && req.user?.userId) {
      filters.department = 'psychology';
      filters.careerIds = await psychologistCareerService.getAssignedCareerIds(req.user.userId);
    }

    const result = await reportService.generateConsultationsReport(filters, generatedBy);

    res.status(200).json({
      success: true,
      message: 'Consultations report generated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate diagnoses report
 * GET /reports/diagnoses?periodStart=2024-01-01&periodEnd=2024-12-31
 */
export const getDiagnosesReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (hasValidationErrors(req, res)) return;

    const generatedBy = req.user?.userId;
    if (!generatedBy) {
      res.status(401).json({
        success: false,
        message: 'User authentication required',
      });
      return;
    }

    const filters: {
      periodStart: Date;
      periodEnd: Date;
      department?: string;
      careerIds?: string[];
    } = {
      periodStart: new Date(req.query.periodStart as string),
      periodEnd: new Date(req.query.periodEnd as string),
      department: req.query.department as string | undefined,
    };
    if (req.user?.role === 'coordinador_psicologia') {
      filters.department = 'psychology';
    }
    if (req.user?.role === 'coordinador_enfermeria') {
      res.status(403).json({
        success: false,
        message: 'Solo puede generar reportes del departamento de enfermería',
      });
      return;
    }
    if (req.user?.role === 'psicologo' && req.user?.userId) {
      filters.department = 'psychology';
      filters.careerIds = await psychologistCareerService.getAssignedCareerIds(req.user.userId);
    }

    const result = await reportService.generateDiagnosesReport(filters, generatedBy);

    res.status(200).json({
      success: true,
      message: 'Diagnoses report generated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
