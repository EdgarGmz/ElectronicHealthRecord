import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { ROLES } from '../constants/roles';
import psychologistCareerService from './psychologist-career.service';

// Common user selection fields
const userSelectFields: Prisma.UserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  dateOfBirth: true,
  phone: true,
  enrollmentNumber: true,
};

const userBasicSelectFields: Prisma.UserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  role: true,
};

const careerSelectFields: Prisma.CareerSelect = {
  id: true,
  name: true,
  code: true,
};

// Include configuration for list operations (lighter)
const listMedicalRecordInclude: Prisma.MedicalRecordInclude = {
  patient: {
    include: {
      user: {
        select: userSelectFields,
      },
      career: {
        select: careerSelectFields,
      },
    },
  },
  createdByUser: {
    select: userBasicSelectFields,
  },
  updatedByUser: {
    select: userBasicSelectFields,
  },
};

// Include configuration for detailed operations
const detailedMedicalRecordInclude: Prisma.MedicalRecordInclude = {
  patient: {
    include: {
      user: {
        select: userSelectFields,
      },
      career: {
        select: careerSelectFields,
      },
      emergencyContacts: true,
    },
  },
  createdByUser: {
    select: userBasicSelectFields,
  },
  updatedByUser: {
    select: userBasicSelectFields,
  },
  psychologyRecord: {
    include: {
      assignedPsychologist: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  },
  nursingConsultations: {
    orderBy: { consultationDate: 'desc' },
    take: 5,
    include: {
      nurse: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  },
};

/** Expediente solo historial de enfermería (sin psychologyRecord). Para rol enfermero. */
const detailedMedicalRecordIncludeNursingOnly: Prisma.MedicalRecordInclude = {
  patient: {
    include: {
      user: { select: userSelectFields },
      career: { select: careerSelectFields },
      emergencyContacts: true,
    },
  },
  createdByUser: { select: userBasicSelectFields },
  updatedByUser: { select: userBasicSelectFields },
  nursingConsultations: {
    orderBy: { consultationDate: 'desc' },
    include: {
      nurse: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      nursingProcedures: true,
    },
  },
};

// Include configuration for create/update operations (basic patient info)
const basicMedicalRecordInclude: Prisma.MedicalRecordInclude = {
  patient: {
    include: {
      user: {
        select: userSelectFields,
      },
      career: {
        select: careerSelectFields,
      },
    },
  },
  createdByUser: {
    select: userBasicSelectFields,
  },
  updatedByUser: {
    select: userBasicSelectFields,
  },
};

/** Solo expedientes de pacientes con al menos una consulta de enfermería */
const NURSING_MEDICAL_RECORD_WHERE: Prisma.MedicalRecordWhereInput = {
  nursingConsultations: { some: {} },
};

const PATIENT_TYPES_GENERAL = ['faculty', 'administrative'] as const;

export class MedicalRecordService {
  async getAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    userRole?: string,
    userId?: string
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.MedicalRecordWhereInput = {};

    const patientWhere: Prisma.PatientWhereInput = {};
    if (search) {
      patientWhere.user = {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { enrollmentNumber: { contains: search, mode: 'insensitive' } },
        ],
      };
    }
    if (userRole === ROLES.PSICOLOGO && userId) {
      const assignedCareerIds = await psychologistCareerService.getAssignedCareerIds(userId);
      const patientScope: Prisma.PatientWhereInput = {
        OR: [
          { patientType: { in: [...PATIENT_TYPES_GENERAL] } },
          ...(assignedCareerIds.length ? [{ patientType: 'student', careerId: { in: assignedCareerIds } }] : []),
        ],
      };
      where.patient = { AND: [patientScope, ...(Object.keys(patientWhere).length ? [patientWhere] : [])] };
    } else if (Object.keys(patientWhere).length) {
      where.patient = patientWhere;
    }

    if (userRole === 'coordinador_enfermeria') {
      where.AND = [NURSING_MEDICAL_RECORD_WHERE];
    }

    const [medicalRecords, total] = await Promise.all([
      prisma.medicalRecord.findMany({
        where,
        skip,
        take: limit,
        include: listMedicalRecordInclude,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.medicalRecord.count({ where }),
    ]);

    return {
      medicalRecords,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string, userRole?: string, userId?: string) {
    const includeNursingOnly = userRole === ROLES.ENFERMERO;
    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: { id },
      include: includeNursingOnly ? detailedMedicalRecordIncludeNursingOnly : detailedMedicalRecordInclude,
    });

    if (!medicalRecord) {
      throw new AppError('Medical record not found', 404);
    }

    if (userRole === 'coordinador_enfermeria') {
      const hasNursing = medicalRecord.nursingConsultations?.length;
      if (!hasNursing) {
        throw new AppError('Acceso denegado: solo puede ver expedientes de pacientes registrados en enfermería', 403);
      }
    }

    if (userRole === ROLES.PSICOLOGO && userId) {
      const p = medicalRecord.patient;
      const assignedCareerIds = await psychologistCareerService.getAssignedCareerIds(userId);
      const isGeneral = PATIENT_TYPES_GENERAL.includes(p.patientType as (typeof PATIENT_TYPES_GENERAL)[number]);
      const isStudentInScope =
        p.patientType === 'student' && p.careerId != null && assignedCareerIds.length > 0 && assignedCareerIds.includes(p.careerId);
      if (!isGeneral && !isStudentInScope) {
        throw new AppError(
          'Acceso denegado: solo puede ver expedientes de estudiantes de sus carreras asignadas o personal docente/administrativo',
          403
        );
      }
    }

    return medicalRecord;
  }

  async getByPatientId(patientId: string, userRole?: string, userId?: string) {
    const includeNursingOnly = userRole === ROLES.ENFERMERO;
    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: { patientId },
      include: includeNursingOnly ? detailedMedicalRecordIncludeNursingOnly : detailedMedicalRecordInclude,
    });

    if (!medicalRecord) {
      throw new AppError('Medical record not found for this patient', 404);
    }

    if (userRole === 'coordinador_enfermeria') {
      const hasNursing = medicalRecord.nursingConsultations?.length;
      if (!hasNursing) {
        throw new AppError('Acceso denegado: solo puede ver expedientes de pacientes registrados en enfermería', 403);
      }
    }

    if (userRole === ROLES.PSICOLOGO && userId) {
      const p = medicalRecord.patient;
      const assignedCareerIds = await psychologistCareerService.getAssignedCareerIds(userId);
      const isGeneral = PATIENT_TYPES_GENERAL.includes(p.patientType as (typeof PATIENT_TYPES_GENERAL)[number]);
      const isStudentInScope =
        p.patientType === 'student' && p.careerId != null && assignedCareerIds.length > 0 && assignedCareerIds.includes(p.careerId);
      if (!isGeneral && !isStudentInScope) {
        throw new AppError(
          'Acceso denegado: solo puede ver expedientes de estudiantes de sus carreras asignadas o personal docente/administrativo',
          403
        );
      }
    }

    return medicalRecord;
  }

  async create(data: {
    patientId: string;
    bloodType?: string;
    allergies?: string;
    chronicConditions?: string;
    currentMedications?: string;
    familyHistory?: string;
    notes?: string;
    createdBy: string;
  }) {
    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId },
    });

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    const createdByUser = await prisma.user.findUnique({
      where: { id: data.createdBy },
      select: { role: true },
    });
    if (createdByUser?.role === ROLES.PSICOLOGO) {
      const assignedCareerIds = await psychologistCareerService.getAssignedCareerIds(data.createdBy);
      const isGeneral = PATIENT_TYPES_GENERAL.includes(patient.patientType as (typeof PATIENT_TYPES_GENERAL)[number]);
      const isStudentInScope =
        patient.patientType === 'student' && patient.careerId != null && assignedCareerIds.length > 0 && assignedCareerIds.includes(patient.careerId);
      if (!isGeneral && !isStudentInScope) {
        throw new AppError(
          'Solo puede crear expedientes para estudiantes de sus carreras asignadas o personal docente/administrativo',
          403
        );
      }
    }

    // Check if medical record already exists for this patient
    const existingRecord = await prisma.medicalRecord.findUnique({
      where: { patientId: data.patientId },
    });

    if (existingRecord) {
      throw new AppError('Medical record already exists for this patient', 409);
    }

    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        patientId: data.patientId,
        bloodType: data.bloodType,
        allergies: data.allergies,
        chronicConditions: data.chronicConditions,
        currentMedications: data.currentMedications,
        familyHistory: data.familyHistory,
        notes: data.notes,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
      },
      include: basicMedicalRecordInclude,
    });

    return medicalRecord;
  }

  /**
   * Asegura que el paciente tenga expediente médico y, si el usuario es psicólogo, expediente de psicología.
   * Crea lo que falte para que pueda registrarse una sesión. Devuelve el expediente completo.
   */
  async ensureExpedientForPatient(patientId: string, userId: string, userRole: string) {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { career: true },
    });
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    const creator = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    const role = creator?.role?.toLowerCase().trim();
    const allowedRoles = [ROLES.PSICOLOGO, ROLES.ENFERMERO, ROLES.COORDINADOR_PSICOLOGIA] as const;
    if (!role || !allowedRoles.includes(role as (typeof allowedRoles)[number])) {
      throw new AppError('No tiene permiso para crear expedientes', 403);
    }

    if (role === ROLES.PSICOLOGO) {
      const assignedCareerIds = await psychologistCareerService.getAssignedCareerIds(userId);
      const isGeneral = PATIENT_TYPES_GENERAL.includes(patient.patientType as (typeof PATIENT_TYPES_GENERAL)[number]);
      const isStudentInScope =
        patient.patientType === 'student' && patient.careerId != null && assignedCareerIds.length > 0 && assignedCareerIds.includes(patient.careerId);
      if (!isGeneral && !isStudentInScope) {
        throw new AppError(
          'Solo puede crear expedientes para estudiantes de sus carreras asignadas o personal docente/administrativo',
          403
        );
      }
    }

    let medicalRecord = await prisma.medicalRecord.findUnique({
      where: { patientId },
      include: { psychologyRecord: true },
    });

    if (!medicalRecord) {
      medicalRecord = await prisma.medicalRecord.create({
        data: {
          patientId,
          createdBy: userId,
          updatedBy: userId,
        },
        include: { psychologyRecord: true },
      });
    }

    if (role === ROLES.PSICOLOGO && !medicalRecord.psychologyRecord) {
      await prisma.psychologyRecord.create({
        data: {
          medicalRecordId: medicalRecord.id,
          suicideRiskLevel: 'none',
          violenceRiskLevel: 'none',
          assignedPsychologistId: userId,
        },
      });
    }

    return this.getByPatientId(patientId, userRole, userId);
  }

  async update(
    id: string,
    data: {
      bloodType?: string;
      allergies?: string;
      chronicConditions?: string;
      currentMedications?: string;
      familyHistory?: string;
      notes?: string;
      updatedBy: string;
    },
    userRole?: string
  ) {
    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: { id },
      include: { nursingConsultations: { take: 1, select: { id: true } } },
    });

    if (!medicalRecord) {
      throw new AppError('Medical record not found', 404);
    }

    if (userRole === 'coordinador_enfermeria' && !medicalRecord.nursingConsultations?.length) {
      throw new AppError('Acceso denegado: solo puede editar expedientes de pacientes registrados en enfermería', 403);
    }

    const updatedRecord = await prisma.medicalRecord.update({
      where: { id },
      data,
      include: basicMedicalRecordInclude,
    });

    return updatedRecord;
  }
}

export default new MedicalRecordService();
