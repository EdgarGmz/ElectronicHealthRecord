import { Router } from 'express';
import studentController, {
  getAllStudentsValidation,
  getStudentByIdValidation,
} from '../controllers/student.controller';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/students
 * @desc    Get all students with pagination and search
 * @access  Private (All authenticated users)
 * @query   page - Page number (default: 1)
 * @query   limit - Results per page (default: 10, max: 100)
 * @query   search - Search by name, email, or enrollment number
 * @query   careerId - Filter by career ID
 */
router.get(
  '/',
  validate(getAllStudentsValidation),
  studentController.getAll.bind(studentController)
);

/**
 * @route   GET /api/students/:id
 * @desc    Get student by ID with full details
 * @access  Private (All authenticated users)
 * @param   id - Student (patient) UUID
 */
router.get(
  '/:id',
  validate(getStudentByIdValidation),
  studentController.getById.bind(studentController)
);

export default router;
