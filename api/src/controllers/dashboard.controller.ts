import { Response, NextFunction } from 'express';
import { query, validationResult } from 'express-validator';
import {
  getDashboardChartData,
  getNursingKpis as getNursingKpisService,
  getNursingPatientsSeriesFiltered,
  getNursingStaffProgress,
  getMedicationStockSummary,
  type PeriodType,
  type NursingStaffProgressPeriod,
} from '../services/dashboard-stats.service';
import { getCoordinatorPsychologyDashboardData } from '../services/coordinator-psychology-dashboard.service';
import { AuthRequest } from '../middleware/auth';

export const dashboardChartValidation = [
  query('periodType').optional().isIn(['day', 'month', 'year']).withMessage('periodType must be day, month, or year'),
  query('startDate').isISO8601().withMessage('Valid startDate (ISO 8601) is required'),
  query('endDate').isISO8601().withMessage('Valid endDate (ISO 8601) is required'),
];

export const nursingPatientsSeriesValidation = [
  query('periodType').optional().isIn(['day', 'month', 'year']).withMessage('periodType must be day, month, or year'),
  query('startDate').isISO8601().withMessage('Valid startDate (ISO 8601) is required'),
  query('endDate').isISO8601().withMessage('Valid endDate (ISO 8601) is required'),
  query('careerId').optional().isUUID().withMessage('careerId must be a valid UUID'),
  query('includeGeneral').optional().isBoolean().withMessage('includeGeneral must be boolean'),
  query('sex').optional().isIn(['male', 'female']).withMessage('sex must be male or female'),
];

export const getChartData = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      return;
    }

    const periodType = (req.query.periodType as PeriodType) || 'month';
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);

    if (endDate < startDate) {
      res.status(400).json({ success: false, message: 'endDate must be after startDate' });
      return;
    }

    const data = await getDashboardChartData({ periodType, startDate, endDate });

    res.status(200).json({
      success: true,
      message: 'Dashboard chart data retrieved successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getCoordinatorPsychology = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    if (!userId || !userRole) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const data = await getCoordinatorPsychologyDashboardData(userId, userRole);
    res.status(200).json({
      success: true,
      message: 'Coordinator psychology dashboard data',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getNursingKpis = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Mantener compatibilidad con firma Express sin disparar `noUnusedParameters`.
    void req;
    const data = await getNursingKpisService();
    res.status(200).json({
      success: true,
      message: 'Nursing KPIs',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getNursingPatientsSeries = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      return;
    }
    const periodType = (req.query.periodType as PeriodType) || 'month';
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);
    if (endDate < startDate) {
      res.status(400).json({ success: false, message: 'endDate must be after startDate' });
      return;
    }
    const careerId = (req.query.careerId as string | undefined) || undefined;
    const includeGeneralRaw = req.query.includeGeneral as string | undefined;
    const includeGeneral = includeGeneralRaw != null ? includeGeneralRaw === 'true' : false;
    const sex = (req.query.sex as 'male' | 'female' | undefined) || undefined;

    const series = await getNursingPatientsSeriesFiltered({
      periodType,
      startDate,
      endDate,
      careerId,
      includeGeneral,
      sex,
    });

    res.status(200).json({
      success: true,
      message: 'Nursing patients series',
      data: { series },
    });
  } catch (error) {
    next(error);
  }
};

export const nursingStaffProgressValidation = [
  query('period')
    .optional()
    .isIn(['week', 'month', 'year'])
    .withMessage('period must be week, month, or year'),
];

export const getNursingStaffProgressHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      return;
    }

    const period = (req.query.period as NursingStaffProgressPeriod) || 'month';
    const progress = await getNursingStaffProgress(period);
    res.status(200).json({
      success: true,
      message: 'Nursing staff progress',
      data: { progress, period },
    });
  } catch (error) {
    next(error);
  }
};

export const getMedicationStockSummaryHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Mantener compatibilidad con firma Express sin disparar `noUnusedParameters`.
    void req;
    const data = await getMedicationStockSummary();
    res.status(200).json({
      success: true,
      message: 'Medication stock summary',
      data,
    });
  } catch (error) {
    next(error);
  }
};
