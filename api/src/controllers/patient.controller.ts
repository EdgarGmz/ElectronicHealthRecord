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
  body('careerId')
    .optional({ values: 'null' })
    .isUUID()
    .withMessage('Valid career ID is required when patient type is student')
    .bail()
    .custom((value, { req }) => {
      if (req.body?.patientType === 'student' && !value) {
        throw new Error('Career is required for students');
      }
      return true;
    }),
  // Optional medical record fields (blood type, allergies, etc.)
  body('bloodType')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood type'),
  body('allergies').optional().isString().withMessage('Allergies must be a string'),
  body('chronicConditions').optional().isString().withMessage('Chronic conditions must be a string'),
  body('currentMedications')
    .optional()
    .isString()
    .withMessage('Current medications must be a string'),
  body('familyHistory').optional().isString().withMessage('Family history must be a string'),
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
  body('careerId').optional({ values: 'null' }).isUUID().withMessage('Career ID must be a valid UUID'),
];

export class PatientController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || (req.query.filter as string);
      const patientType = req.query.patientType as string;
      const careerId = req.query.careerId as string | undefined;
      const userRole = req.user?.role != null ? String(req.user.role) : undefined;
      const userId = req.user?.userId != null ? String(req.user.userId) : undefined;

      const result = await patientService.getAll(page, limit, search, patientType, userRole, userId, careerId);

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

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = {
        ...req.body,
        dateOfBirth: new Date(req.body.dateOfBirth),
      };

      const options =
        req.user?.userId && req.user?.role
          ? { createdBy: req.user.userId, creatorRole: req.user.role }
          : undefined;

      const patient = await patientService.create(data, options);

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
