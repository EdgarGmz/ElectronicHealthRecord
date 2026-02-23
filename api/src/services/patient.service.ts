import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { hashPassword } from '../utils/password';
import { ROLES } from '../constants/roles';
import psychologistCareerService from './psychologist-career.service';

/** Pacientes que tienen al menos una consulta de enfermería (registrados en enfermería) */
const NURSING_PATIENT_WHERE: Prisma.PatientWhereInput = {
  medicalRecord: {
    nursingConsultations: { some: {} },
  },
};

/** Tipos de paciente que pueden ser atendidos por cualquier psicólogo (sin filtro por carrera) */
const PATIENT_TYPES_GENERAL = ['faculty', 'administrative'] as const;

export class PatientService {
  async getAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    patientType?: string,
    userRole?: string,
    userId?: string
  ) {
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

    if (userRole === 'coordinador_enfermeria') {
      where.AND = [NURSING_PATIENT_WHERE];
    }

    if (userRole === ROLES.PSICOLOGO && userId) {
      const assignedCareerIds = await psychologistCareerService.getAssignedCareerIds(userId);
      const scopeWhere: Prisma.PatientWhereInput = {
        OR: [
          { patientType: { in: [...PATIENT_TYPES_GENERAL] } },
          ...(assignedCareerIds.length
            ? [{ patientType: 'student', careerId: { in: assignedCareerIds } }]
            : []),
        ],
      };
      where.AND = [...(where.AND || []), scopeWhere];
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

  /**
   * Busca un paciente por matrícula o número de empleado (campo enrollmentNumber del usuario).
   * Usado en enfermería y psicología para: capturar matrícula/nº empleado → si existe abrir expediente, si no crear nuevo.
   * No aplica filtro por departamento: cualquier personal autorizado puede buscar para abrir o crear expediente.
   */
  async findByEnrollmentOrEmployeeNumber(enrollmentOrEmployeeNumber: string) {
    const trimmed = enrollmentOrEmployeeNumber?.trim();
    if (!trimmed) {
      throw new AppError('Matrícula o número de empleado es requerido', 400);
    }

    const user = await prisma.user.findFirst({
      where: {
        enrollmentNumber: { equals: trimmed, mode: 'insensitive' },
        role: ROLES.PATIENT,
      },
      select: { id: true },
    });

    if (!user) {
      throw new AppError('No se encontró ningún paciente con esa matrícula o número de empleado', 404);
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
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
        career: { select: { id: true, name: true, code: true } },
        emergencyContacts: true,
        medicalRecord: { select: { id: true } },
      },
    });

    if (!patient) {
      throw new AppError('No se encontró expediente para ese usuario', 404);
    }

    return patient;
  }

  async getById(id: string, userRole?: string, userId?: string) {
    const includeNursingCheck = userRole === 'coordinador_enfermeria';
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
        ...(includeNursingCheck && {
          medicalRecord: {
            select: {
              id: true,
              nursingConsultations: { take: 1, select: { id: true } },
            },
          },
        }),
      },
    });

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    if (userRole === 'coordinador_enfermeria') {
      const mr = patient.medicalRecord as { nursingConsultations?: { id: string }[] } | null | undefined;
      if (!mr?.nursingConsultations?.length) {
        throw new AppError('Acceso denegado: solo puede ver pacientes registrados en enfermería', 403);
      }
    }

    if (userRole === ROLES.PSICOLOGO && userId) {
      const assignedCareerIds = await psychologistCareerService.getAssignedCareerIds(userId);
      const isGeneral = PATIENT_TYPES_GENERAL.includes(patient.patientType as (typeof PATIENT_TYPES_GENERAL)[number]);
      const isStudentInScope =
        patient.patientType === 'student' && assignedCareerIds.length > 0 && assignedCareerIds.includes(patient.careerId);
      if (!isGeneral && !isStudentInScope) {
        throw new AppError(
          'Acceso denegado: solo puede atender estudiantes de sus carreras asignadas o personal docente/administrativo',
          403
        );
      }
    }

    if (includeNursingCheck) {
      const { medicalRecord, ...rest } = patient;
      return { ...rest, medicalRecord: medicalRecord ? { id: medicalRecord.id } : undefined };
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
          role: ROLES.PATIENT,
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
