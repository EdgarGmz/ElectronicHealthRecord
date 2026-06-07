import { Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import userService from '../services/user.service';
import psychologistCareerService from '../services/psychologist-career.service';
import { AuthRequest } from '../middleware/auth';
import { ROLES, ROLES_VISIBLE_IN_USERS } from '../constants/roles';
import prisma from '../config/database';
import { comparePassword } from '../utils/password';

export const createUserValidation = [
  body('email').isEmail().withMessage('Email válido requerido'),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('firstName').notEmpty().withMessage('Nombre requerido'),
  body('lastName').notEmpty().withMessage('Apellido requerido'),
  body('dateOfBirth').optional().isISO8601().withMessage('Fecha de nacimiento válida requerida'),
  body('role').isIn(ROLES_VISIBLE_IN_USERS).withMessage('Rol debe ser uno de: coordinador_psicologia, coordinador_enfermeria, psicologo, enfermero'),
  body('phone').optional().trim(),
  body('enrollmentNumber').optional().trim(),
];

export const updateUserValidation = [
  param('id').isUUID().withMessage('Invalid user ID'),
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date of birth'),
  body('role').optional().isIn(ROLES_VISIBLE_IN_USERS).withMessage('Rol debe ser uno de: coordinador_psicologia, coordinador_enfermeria, psicologo, enfermero'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

export const updateMeValidation = [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date of birth'),
];

export const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Contraseña actual es requerida'),
  body('newPassword').isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres'),
];

export class UserController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Security is enforced at route-level (admin-only). Keep an explicit check as defense-in-depth.
      if (req.user?.role !== ROLES.ADMIN) {
        res.status(403).json({ success: false, message: 'Insufficient permissions' });
        return;
      }
      const data = {
        ...req.body,
        dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : new Date('1990-01-01'),
      };
      const user = await userService.create(data);
      res.status(201).json({
        success: true,
        message: 'Usuario creado correctamente',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await userService.getAll(page, limit, search);

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /** Current user profile — any authenticated user */
  async getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      const user = await userService.getById(userId);
      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /** Update current user profile — any authenticated user */
  async updateMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      const data = {
        ...req.body,
        dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined,
      };
      const user = await userService.update(userId, data);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /** Carreras asignadas al psicólogo actual (solo rol psicólogo). */
  async getMeCareers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const role = req.user?.role;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }
      if (role !== ROLES.PSICOLOGO) {
        res.status(403).json({ success: false, message: 'Solo disponible para rol psicólogo' });
        return;
      }
      const careerIds = await psychologistCareerService.getAssignedCareerIds(userId);
      res.status(200).json({
        success: true,
        message: 'Carreras asignadas',
        data: { careerIds },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.getById(id);

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = req.user?.userId;
      const adminPassword = (req.headers['x-admin-password'] as string) || req.body.adminPassword;

      if (!adminId) {
        res.status(401).json({ success: false, message: 'No autenticado' });
        return;
      }

      if (!adminPassword) {
        res.status(400).json({ success: false, message: 'Se requiere la contraseña del administrador para confirmar esta acción' });
        return;
      }

      const admin = await prisma.user.findUnique({ where: { id: adminId } });
      if (!admin) {
        res.status(404).json({ success: false, message: 'Administrador no encontrado' });
        return;
      }

      const isPasswordValid = await comparePassword(adminPassword, admin.passwordHash);
      if (!isPasswordValid) {
        res.status(401).json({ success: false, message: 'Contraseña de administrador incorrecta' });
        return;
      }

      const { adminPassword: _, ...restBody } = req.body;
      const data = {
        ...restBody,
        dateOfBirth: restBody.dateOfBirth ? new Date(restBody.dateOfBirth) : undefined,
      };

      const user = await userService.update(id, data);

      res.status(200).json({
        success: true,
        message: 'Usuario actualizado correctamente',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = req.user?.userId;
      const adminPassword = (req.headers['x-admin-password'] as string) || req.body.adminPassword;

      if (!adminId) {
        res.status(401).json({ success: false, message: 'No autenticado' });
        return;
      }

      if (!adminPassword) {
        res.status(400).json({ success: false, message: 'Se requiere la contraseña del administrador para confirmar esta acción' });
        return;
      }

      const admin = await prisma.user.findUnique({ where: { id: adminId } });
      if (!admin) {
        res.status(404).json({ success: false, message: 'Administrador no encontrado' });
        return;
      }

      const isPasswordValid = await comparePassword(adminPassword, admin.passwordHash);
      if (!isPasswordValid) {
        res.status(401).json({ success: false, message: 'Contraseña de administrador incorrecta' });
        return;
      }

      const result = await userService.delete(id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'No autenticado' });
        return;
      }
      const result = await userService.changePassword(userId, req.body);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
