import { Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import patientService from '../services/patient.service';
import { AuthRequest } from '../middleware/auth';

export const createPatientValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('patientType').notEmpty().withMessage('Patient type is required'),
  body('careerId').isUUID().withMessage('Valid career ID is required'),
];

export const updatePatientValidation = [
  param('id').isUUID().withMessage('Invalid patient ID'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('firstName').optional().notEmpty().withMessage('First name is required'),
  body('lastName').optional().notEmpty().withMessage('Last name is required'),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required'),
  body('phone').optional().notEmpty().withMessage('Phone number is required'),
  body('enrollmentNumber').optional().notEmpty().withMessage('Enrollment number is required'),
  body('maritalStatus').optional().notEmpty().withMessage('Marital status cannot be empty'),
  body('guardianName').optional().notEmpty().withMessage('Guardian name cannot be empty'),
  body('guardianPhone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
  body('group').optional().notEmpty().withMessage('Group cannot be empty'),
  body('occupation').optional().notEmpty().withMessage('Occupation cannot be empty'),
  body('trimester').optional().isInt({ min: 1, max: 12 }).withMessage('Invalid trimester'),
];

export class PatientController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || (req.query.filter as string);
      const patientType = req.query.patientType as string;
      const userRole = req.user?.role;
      const userId = req.user?.userId;

      const result = await patientService.getAll(page, limit, search, patientType, userRole, userId);

      res.status(200).json({
        success: true,
        message: 'Patients retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /** Buscar paciente por matrícula o número de empleado para abrir expediente (o crear si no existe). */
  async getByEnrollmentOrEmployee(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const number = req.params.number?.trim();
      if (!number) {
        res.status(400).json({
          success: false,
          message: 'Matrícula o número de empleado es requerido',
        });
        return;
      }
      const patient = await patientService.findByEnrollmentOrEmployeeNumber(number);
      res.status(200).json({
        success: true,
        message: 'Paciente encontrado; puede abrir el expediente.',
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const patient = await patientService.getById(id, req.user?.role, req.user?.userId);

      res.status(200).json({
        success: true,
        message: 'Patient retrieved successfully',
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = {
        ...req.body,
        dateOfBirth: new Date(req.body.dateOfBirth),
      };

      const patient = await patientService.create(data);

      res.status(201).json({
        success: true,
        message: 'Patient created successfully',
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const patient = await patientService.update(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Patient updated successfully',
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await patientService.delete(id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PatientController();
