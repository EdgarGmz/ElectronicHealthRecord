import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import careerService from '../services/career.service';

export const createCareerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre de la carrera es requerido')
    .isLength({ max: 150 })
    .withMessage('El nombre de la carrera no puede exceder 150 caracteres'),
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Las siglas de la carrera son requeridas')
    .isLength({ max: 30 })
    .withMessage('Las siglas de la carrera no pueden exceder 30 caracteres'),
];

export const updateCareerValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre de la carrera no puede estar vacío')
    .isLength({ max: 150 })
    .withMessage('El nombre de la carrera no puede exceder 150 caracteres'),
  body('code')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Las siglas de la carrera no pueden estar vacías')
    .isLength({ max: 30 })
    .withMessage('Las siglas de la carrera no pueden exceder 30 caracteres'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('El campo isActive debe ser un booleano'),
];

export class CareerController {
  /**
   * Obtiene la lista de carreras activas.
   */
  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const careers = await careerService.getAllActive();
      res.status(200).json({
        success: true,
        message: 'Careers retrieved successfully',
        data: careers,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene todas las carreras con la cantidad de alumnos (panel de admin).
   */
  async getAllAdmin(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const careers = await careerService.getAllAdmin();
      res.status(200).json({
        success: true,
        message: 'All careers retrieved successfully for admin',
        data: careers,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crea una nueva carrera.
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, code } = req.body;
      const career = await careerService.create({ name, code });
      res.status(201).json({
        success: true,
        message: 'Career created successfully',
        data: career,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza una carrera existente.
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, code, isActive } = req.body;
      const career = await careerService.update(id, { name, code, isActive });
      res.status(200).json({
        success: true,
        message: 'Career updated successfully',
        data: career,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina una carrera (o arroja error si no se puede).
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await careerService.delete(id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CareerController();
