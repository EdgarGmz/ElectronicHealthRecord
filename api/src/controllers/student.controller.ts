import { Request, Response, NextFunction } from 'express';
import { param, query } from 'express-validator';
import studentService from '../services/student.service';

// Validation for getting all students
export const getAllStudentsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().trim().withMessage('Search must be a string'),
  query('careerId').optional().isUUID().withMessage('Career ID must be a valid UUID'),
];

// Validation for getting a student by ID
export const getStudentByIdValidation = [
  param('id').isUUID().withMessage('Invalid student ID'),
];

export class StudentController {
  /**
   * Get all students with pagination and search
   * Supports filtering by name, enrollment number, and career
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const careerId = req.query.careerId as string;

      const result = await studentService.getAll(page, limit, search, careerId);

      res.status(200).json({
        success: true,
        message: 'Students retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a student by ID with full details
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const student = await studentService.getById(id);

      res.status(200).json({
        success: true,
        message: 'Student retrieved successfully',
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new StudentController();
