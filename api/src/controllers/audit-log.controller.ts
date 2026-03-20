import { Response, NextFunction } from 'express';
import { query } from 'express-validator';
import auditLogService from '../services/audit-log.service';
import { AuthRequest } from '../middleware/auth';

export const getAuditLogsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('userId').optional().isUUID().withMessage('User ID must be a valid UUID'),
  query('action').optional().isString().withMessage('Action must be a string'),
  query('tableName').optional().isString().withMessage('Table name must be a string'),
  query('role').optional().isString().withMessage('Role must be a string'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
];

/**
 * Get audit logs with optional filtering
 * @route GET /api/audit-logs
 * @param req - Express request with query parameters (page, limit, userId, action, tableName, startDate, endDate)
 * @param res - Express response
 * @param next - Express next function for error handling
 * @returns Promise<void> - Resolves with paginated audit logs
 */
export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filters: {
      userId?: string;
      action?: string;
      tableName?: string;
      role?: string;
      startDate?: Date;
      endDate?: Date;
    } = {};

    if (req.query.userId) {
      filters.userId = req.query.userId as string;
    }

    if (req.query.action) {
      filters.action = req.query.action as string;
    }

    if (req.query.tableName) {
      filters.tableName = req.query.tableName as string;
    }

    if (req.query.role) {
      filters.role = req.query.role as string;
    }

    if (req.query.startDate) {
      filters.startDate = new Date(req.query.startDate as string);
    }

    if (req.query.endDate) {
      filters.endDate = new Date(req.query.endDate as string);
    }

    const userRole = req.user?.role;
    const result = await auditLogService.getAuditLogs(page, limit, filters, userRole);

    res.status(200).json({
      success: true,
      message: 'Audit logs retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
