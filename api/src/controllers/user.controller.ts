import { Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import userService from '../services/user.service';
import { AuthRequest } from '../middleware/auth';
import { ROLES } from '../constants/roles';

export const createUserValidation = [
  body('email').isEmail().withMessage('Email válido requerido'),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('firstName').notEmpty().withMessage('Nombre requerido'),
  body('lastName').notEmpty().withMessage('Apellido requerido'),
  body('dateOfBirth').isISO8601().withMessage('Fecha de nacimiento válida requerida'),
  body('role').notEmpty().withMessage('Rol requerido'),
  body('phone').optional().trim(),
  body('enrollmentNumber').optional().trim(),
];

export const updateUserValidation = [
  param('id').isUUID().withMessage('Invalid user ID'),
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date of birth'),
];

export class UserController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role === ROLES.COORDINADOR_PSICOLOGIA && req.body.role !== ROLES.PSICOLOGO) {
        res.status(403).json({
          success: false,
          message: 'El coordinador de psicología solo puede crear usuarios con rol psicólogo',
        });
        return;
      }
      if (req.user?.role === ROLES.COORDINADOR_ENFERMERIA && req.body.role !== ROLES.ENFERMERO) {
        res.status(403).json({
          success: false,
          message: 'El coordinador de enfermería solo puede crear usuarios con rol enfermero',
        });
        return;
      }
      const data = {
        ...req.body,
        dateOfBirth: new Date(req.body.dateOfBirth),
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
      const data = {
        ...req.body,
        dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined,
      };

      const user = await userService.update(id, data);

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await userService.delete(id);

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
