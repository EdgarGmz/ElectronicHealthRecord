import { Response, NextFunction } from 'express';
import { query, validationResult } from 'express-validator';
import { getDashboardChartData, type PeriodType } from '../services/dashboard-stats.service';
import { getCoordinatorPsychologyDashboardData } from '../services/coordinator-psychology-dashboard.service';
import { AuthRequest } from '../middleware/auth';

export const dashboardChartValidation = [
  query('periodType').optional().isIn(['day', 'month', 'year']).withMessage('periodType must be day, month, or year'),
  query('startDate').isISO8601().withMessage('Valid startDate (ISO 8601) is required'),
  query('endDate').isISO8601().withMessage('Valid endDate (ISO 8601) is required'),
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
