import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class StudentService {
  /**
   * Get all students with pagination and search
   * Filters for patients who have enrollmentNumber (students)
   */
  async getAll(page: number = 1, limit: number = 10, search?: string, careerId?: string) {
    const skip = (page - 1) * limit;

    // Build the where clause
    const where: Prisma.PatientWhereInput = {
      // Base condition: must have enrollmentNumber (students have enrollment numbers)
      user: {
        enrollmentNumber: {
          not: null,
        },
      },
    };

    // Add search filter if provided
    if (search) {
      where.AND = [
        {
          user: {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { enrollmentNumber: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    // Add career filter if provided
    if (careerId) {
      where.careerId = careerId;
    }

    const [students, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              phone: true,
              enrollmentNumber: true,
              isActive: true,
            },
          },
          career: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.patient.count({ where }),
    ]);

    return {
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a student by ID with detailed information
   */
  async getById(id: string) {
    const student = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            phone: true,
            enrollmentNumber: true,
            isActive: true,
            role: true,
          },
        },
        career: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        emergencyContacts: {
          select: {
            id: true,
            name: true,
            relationship: true,
            phone: true,
            phoneSecondary: true,
            priority: true,
          },
        },
      },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    // Verify this is actually a student (has enrollment number)
    if (!student.user.enrollmentNumber) {
      throw new AppError('Patient is not a student', 400);
    }

    return student;
  }
}

export default new StudentService();
