import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { hashPassword } from '../utils/password';

export class PatientService {
  async getAll(page: number = 1, limit: number = 10, search?: string, patientType?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.user = {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { enrollmentNumber: { contains: search, mode: 'insensitive' as const } },
        ],
      };
    }

    if (patientType) {
      where.patientType = patientType;
    }

    const [patients, total] = await Promise.all([
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
        orderBy: { createdAt: 'desc' },
      }),
      prisma.patient.count({ where }),
    ]);

    return {
      patients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const patient = await prisma.patient.findUnique({
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
          },
        },
        career: true,
        emergencyContacts: true,
      },
    });

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    return patient;
  }

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    phone?: string;
    enrollmentNumber?: string;
    patientType: string;
    maritalStatus?: string;
    guardianName?: string;
    guardianPhone?: string;
    careerId: string;
    group?: string;
    occupation?: string;
    trimester?: number;
  }) {
    // Check if career exists
    const career = await prisma.career.findUnique({
      where: { id: data.careerId },
    });

    if (!career) {
      throw new AppError('Career not found', 404);
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await hashPassword(data.password);

    // Create user and patient in a transaction
    const patient = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          phone: data.phone,
          enrollmentNumber: data.enrollmentNumber,
          role: 'patient',
        },
      });

      const newPatient = await tx.patient.create({
        data: {
          userId: user.id,
          patientType: data.patientType,
          maritalStatus: data.maritalStatus,
          guardianName: data.guardianName,
          guardianPhone: data.guardianPhone,
          careerId: data.careerId,
          group: data.group,
          occupation: data.occupation,
          trimester: data.trimester,
        },
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
            },
          },
          career: true,
        },
      });

      return newPatient;
    });

    return patient;
  }

  async update(id: string, data: {
    maritalStatus?: string;
    guardianName?: string;
    guardianPhone?: string;
    group?: string;
    occupation?: string;
    trimester?: number;
  }) {
    const patient = await prisma.patient.findUnique({ where: { id } });

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
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
          },
        },
        career: true,
      },
    });

    return updatedPatient;
  }

  async delete(id: string) {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    // Deactivate the user instead of deleting
    await prisma.user.update({
      where: { id: patient.userId },
      data: { isActive: false, updatedAt: new Date() },
    });

    return { message: 'Patient deactivated successfully' };
  }
}

export default new PatientService();
