import crypto from 'crypto';
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
    userId?: string,
    careerId?: string
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.PatientWhereInput = {
      user: { isActive: true },
    };

    if (search) {
      where.user = {
        ...(where.user as object),
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

    const normalizedRole = userRole?.toLowerCase().trim();

    if (normalizedRole === 'coordinador_enfermeria') {
      where.AND = [NURSING_PATIENT_WHERE];
    }

    // Psicólogo: solo estudiantes de sus carreras asignadas + docente/administrativo
    if (normalizedRole === ROLES.PSICOLOGO) {
      if (!userId) {
        // Sin userId no aplicar filtro podría filtrar datos; devolver vacío
        where.id = '00000000-0000-0000-0000-000000000000';
        where.AND = [];
      } else {
        const assignedCareerIds = await psychologistCareerService.getAssignedCareerIds(userId);
        const scopeWhere: Prisma.PatientWhereInput = {
          OR: [
            { patientType: { in: [...PATIENT_TYPES_GENERAL] } },
            ...(assignedCareerIds.length > 0
              ? [{ patientType: 'student', careerId: { in: assignedCareerIds } }]
              : []),
          ],
        };
        const existingAnd = Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : [];
        where.AND = [...existingAnd, scopeWhere];

        // Filtro opcional por carrera: solo si la carrera está asignada al psicólogo
        if (careerId?.trim() && assignedCareerIds.includes(careerId.trim())) {
          where.careerId = careerId.trim();
        }
      }
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
        patient.patientType === 'student' && patient.careerId != null && assignedCareerIds.length > 0 && assignedCareerIds.includes(patient.careerId);
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

  async create(
    data: {
      email: string;
      password?: string;
      firstName: string;
      lastName: string;
      dateOfBirth: Date;
      phone?: string;
      enrollmentNumber?: string;
      patientType: string;
      maritalStatus?: string;
      guardianName?: string;
      guardianPhone?: string;
      careerId?: string | null;
      group?: string;
      occupation?: string;
      trimester?: number;
      // Optional medical record fields (created together with medicalRecord for staff roles).
      bloodType?: string | null;
      allergies?: string | null;
      chronicConditions?: string | null;
      currentMedications?: string | null;
      familyHistory?: string | null;
    },
    options?: { createdBy: string; creatorRole: string }
  ) {
    if (data.patientType === 'student') {
      if (!data.careerId?.trim()) {
        throw new AppError('Career is required for students', 400);
      }
      const career = await prisma.career.findUnique({
        where: { id: data.careerId },
      });
      if (!career) {
        throw new AppError('Career not found', 404);
      }
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Patients do not access the system; use provided password or generate a random one
    const passwordToUse = data.password ?? crypto.randomBytes(32).toString('hex');
    const passwordHash = await hashPassword(passwordToUse);

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
          sex: (data as any).sex ?? null,
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
          careerId: data.patientType === 'student' && data.careerId ? data.careerId : null,
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

    // Si quien crea puede crear expedientes (psicólogo o enfermero), crear expediente médico y, si es psicólogo, expediente de psicología
    if (options?.createdBy && options?.creatorRole) {
      const role = options.creatorRole.toLowerCase().trim();
      const canCreateMedicalRecord =
        role === ROLES.PSICOLOGO ||
        role === ROLES.COORDINADOR_PSICOLOGIA ||
        role === ROLES.ENFERMERO ||
        role === ROLES.COORDINADOR_ENFERMERIA;

      if (canCreateMedicalRecord) {
        const existingMr = await prisma.medicalRecord.findUnique({
          where: { patientId: patient.id },
        });
        if (!existingMr) {
          const medicalRecord = await prisma.medicalRecord.create({
            data: {
              patientId: patient.id,
              createdBy: options.createdBy,
              updatedBy: options.createdBy,
              bloodType: data.bloodType ?? undefined,
              allergies: data.allergies ?? undefined,
              chronicConditions: data.chronicConditions ?? undefined,
              currentMedications: data.currentMedications ?? undefined,
              familyHistory: data.familyHistory ?? undefined,
            },
          });
          if (role === ROLES.PSICOLOGO || role === ROLES.COORDINADOR_PSICOLOGIA) {
            await prisma.psychologyRecord.create({
              data: {
                medicalRecordId: medicalRecord.id,
                suicideRiskLevel: 'none',
                violenceRiskLevel: 'none',
                assignedPsychologistId: options.createdBy,
              },
            });
          }
        }
      }
    }

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

    // Build Patient update data (Prisma PatientUpdateInput uses relations, not careerId)
    const patientUpdateData: Prisma.PatientUpdateInput = {
      updatedAt: new Date(),
    };
    if (data.maritalStatus !== undefined) patientUpdateData.maritalStatus = data.maritalStatus as string;
    if (data.guardianName !== undefined) patientUpdateData.guardianName = data.guardianName as string;
    if (data.guardianPhone !== undefined) patientUpdateData.guardianPhone = data.guardianPhone as string;
    if (data.careerId !== undefined) {
      const careerId = (data.careerId as string | null) || null;
      patientUpdateData.career = careerId
        ? { connect: { id: careerId } }
        : { disconnect: true };
    }
    if (data.group !== undefined) patientUpdateData.group = data.group as string;
    if (data.occupation !== undefined) patientUpdateData.occupation = data.occupation as string;
    if (data.patientType !== undefined) patientUpdateData.patientType = data.patientType as string;
    if (data.trimester !== undefined) {
      const t = data.trimester;
      patientUpdateData.trimester = typeof t === 'string' ? (t === '' ? null : parseInt(t, 10)) : (t as number);
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
        ...patientUpdateData,
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
