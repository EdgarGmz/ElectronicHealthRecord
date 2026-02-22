import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { hashPassword } from '../utils/password';

export class PatientService {
  async getAll(page: number = 1, limit: number = 10, search?: string, patientType?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.PatientWhereInput = {};

    if (search) {
      where.user = {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { enrollmentNumber: { contains: search, mode: 'insensitive' } },
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

  async update(id: string, data: Record<string, unknown>) {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    // Build Patient update data with correct types (Prisma expects number for trimester)
    const patientData: Prisma.PatientUncheckedUpdateInput = {
      updatedAt: new Date(),
    };
    if (data.maritalStatus !== undefined) patientData.maritalStatus = data.maritalStatus as string;
    if (data.guardianName !== undefined) patientData.guardianName = data.guardianName as string;
    if (data.guardianPhone !== undefined) patientData.guardianPhone = data.guardianPhone as string;
    if (data.careerId !== undefined) patientData.careerId = data.careerId as string;
    if (data.group !== undefined) patientData.group = data.group as string;
    if (data.occupation !== undefined) patientData.occupation = data.occupation as string;
    if (data.patientType !== undefined) patientData.patientType = data.patientType as string;
    if (data.trimester !== undefined) {
      const t = data.trimester;
      patientData.trimester = typeof t === 'string' ? (t === '' ? null : parseInt(t, 10)) : (t as number);
    }

    // Build User update data with correct types
    const userUpdateData: Prisma.UserUpdateWithoutPatientInput = {
      updatedAt: new Date(),
    };
    if (data.email !== undefined) userUpdateData.email = data.email as string;
    if (data.firstName !== undefined) userUpdateData.firstName = data.firstName as string;
    if (data.lastName !== undefined) userUpdateData.lastName = data.lastName as string;
    if (data.dateOfBirth !== undefined) userUpdateData.dateOfBirth = new Date(data.dateOfBirth as string);
    if (data.phone !== undefined) userUpdateData.phone = (data.phone as string) || null;
    if (data.enrollmentNumber !== undefined) userUpdateData.enrollmentNumber = (data.enrollmentNumber as string) || null;

    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: {
        ...patientData,
        user: {
          update: userUpdateData,
        },
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
