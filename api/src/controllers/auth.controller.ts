import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import authService from '../services/auth.service';
import logger from '../utils/logger';
import { createAuditLog, AUDIT_ACTIONS, AUDIT_TABLES } from '../utils/audit';
import type { AuthRequest } from '../middleware/auth';

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const registerValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('role').notEmpty().withMessage('Role is required'),
];

export const refreshTokenValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      logger.info(`User logged in: ${email}`);
      await createAuditLog({
        userId: result.user.id,
        action: AUDIT_ACTIONS.LOGIN,
        tableName: AUDIT_TABLES.USER,
        recordId: result.user.id,
        newValues: { email: result.user.email, role: result.user.role },
        req,
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      const email = req.body?.email;
      if (typeof email === 'string' && email) {
        logger.warn(`Login failed: ${email}`);
        // LOGIN_FAILED no se guarda en AuditLog porque userId es obligatorio (FK); el logger queda como registro.
      }
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = {
        ...req.body,
        dateOfBirth: new Date(req.body.dateOfBirth),
      };
      const result = await authService.register(data);

      logger.info(`New user registered: ${data.email}`);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const result = await authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.userId) {
        await createAuditLog({
          userId: req.user.userId,
          action: AUDIT_ACTIONS.LOGOUT,
          tableName: AUDIT_TABLES.USER,
          recordId: req.user.userId,
          newValues: { email: req.user.email },
          req: req as Request,
        });
      }
      // Note: In a production app, implement token blacklisting using Redis or a database
      // to track revoked tokens. Without this, JWTs remain valid until expiration.
      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
