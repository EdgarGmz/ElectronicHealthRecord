import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { ROLES } from '../constants/roles';
import psychologistCareerService from './psychologist-career.service';

const PATIENT_TYPES_GENERAL = ['faculty', 'administrative'] as const;

const sessionInclude = {
  psychologyRecord: {
    include: {
      medicalRecord: {
        include: {
          patient: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  enrollmentNumber: true,
                },
              },
            },
          },
        },
      },
    },
  },
  therapist: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
} as const;

export class TherapySessionService {
  async getAll(
    userId: string,
    userRole: string,
    page: number = 1,
    limit: number = 10,
    filters?: {
      patientId?: string;
      therapistId?: string;
      psychologyRecordId?: string;
      dateFrom?: string;
      dateTo?: string;
      search?: string;
    }
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.TherapySessionWhereInput = {};

    if (userRole === ROLES.PSICOLOGO) {
      where.therapistId = userId;
      const assignedCareerIds = await psychologistCareerService.getAssignedCareerIds(userId);
      const patientScope: Prisma.PatientWhereInput = {
        OR: [
          { patientType: { in: [...PATIENT_TYPES_GENERAL] } },
          ...(assignedCareerIds.length ? [{ patientType: 'student', careerId: { in: assignedCareerIds } }] : []),
        ],
      };
      where.psychologyRecord = {
        medicalRecord: { patient: patientScope },
      };
    } else if (userRole === ROLES.COORDINADOR_PSICOLOGIA) {
      if (filters?.patientId) {
        where.psychologyRecord = { medicalRecord: { patientId: filters.patientId } };
      }
    } else if (userRole === 'coordinador_enfermeria') {
      where.psychologyRecord = {
        medicalRecord: { nursingConsultations: { some: {} } },
      };
    }

    if (filters?.patientId && userRole !== ROLES.COORDINADOR_PSICOLOGIA) {
      const mr = (where.psychologyRecord as Prisma.PsychologyRecordWhereInput)?.medicalRecord as Prisma.MedicalRecordWhereInput | undefined;
      where.psychologyRecord = {
        ...where.psychologyRecord,
        medicalRecord: { ...mr, patientId: filters.patientId },
      };
    }
    if (filters?.therapistId) {
      where.therapistId = filters.therapistId;
    }
    if (filters?.psychologyRecordId) {
      where.psychologyRecordId = filters.psychologyRecordId;
    }

    const extraConditions: Prisma.TherapySessionWhereInput[] = [];
    if (filters?.dateFrom || filters?.dateTo) {
      const gte = filters.dateFrom ? new Date(`${filters.dateFrom}T00:00:00.000Z`) : undefined;
      const lte = filters.dateTo ? new Date(`${filters.dateTo}T23:59:59.999Z`) : undefined;
      extraConditions.push({
        sessionDate: { ...(gte && { gte }), ...(lte && { lte }) },
      });
    }
    const searchTrim = filters?.search?.trim();
    if (searchTrim) {
      extraConditions.push({
        OR: [
          { psychologyRecord: { medicalRecord: { patient: { user: { firstName: { contains: searchTrim, mode: 'insensitive' } } } } } },
          { psychologyRecord: { medicalRecord: { patient: { user: { lastName: { contains: searchTrim, mode: 'insensitive' } } } } } },
          { psychologyRecord: { medicalRecord: { patient: { user: { enrollmentNumber: { contains: searchTrim, mode: 'insensitive' } } } } } },
          { mood: { contains: searchTrim, mode: 'insensitive' } },
        ],
      });
    }
    const finalWhere =
      extraConditions.length > 0 ? ({ AND: [where, ...extraConditions] } as Prisma.TherapySessionWhereInput) : where;

    const [sessions, total] = await Promise.all([
      prisma.therapySession.findMany({
        where: finalWhere,
        skip,
        take: limit,
        include: sessionInclude,
        orderBy: { sessionDate: 'desc' },
      }),
      prisma.therapySession.count({ where: finalWhere }),
    ]);

    return {
      sessions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string, userId: string, userRole: string) {
    const session = await prisma.therapySession.findUnique({
      where: { id },
      include: sessionInclude,
    });
    if (!session) throw new AppError('Therapy session not found', 404);

    if (userRole === ROLES.PSICOLOGO) {
      const assignedCareerIds = await psychologistCareerService.getAssignedCareerIds(userId);
      const p = session.psychologyRecord.medicalRecord.patient;
      const isGeneral = PATIENT_TYPES_GENERAL.includes(p.patientType as any);
      const isStudentInScope =
        p.patientType === 'student' && assignedCareerIds.length > 0 && assignedCareerIds.includes(p.careerId);
      if (!isGeneral && !isStudentInScope) {
        throw new AppError('Access denied to this therapy session', 403);
      }
    } else if (userRole === 'coordinador_enfermeria') {
      const hasNursing = await prisma.nursingConsultation.count({
        where: { medicalRecordId: session.psychologyRecord.medicalRecord.id },
      });
      if (!hasNursing) throw new AppError('Access denied to this therapy session', 403);
    }

    return session;
  }

  async create(
    data: {
      psychologyRecordId: string;
      sessionNumber: number;
      sessionDate: Date;
      sessionDuration?: number;
      mood: string;
      evolutionNotes?: string;
      patientProgress?: string;
      assignedTasks?: string;
      observations?: string;
      nextSessionPlan?: string;
    },
    therapistId: string,
    userRole: string
  ) {
    if (userRole === ROLES.PSICOLOGO) {
      const record = await prisma.psychologyRecord.findUnique({
        where: { id: data.psychologyRecordId },
        include: { medicalRecord: { include: { patient: true } } },
      });
      if (!record) throw new AppError('Psychology record not found', 404);
      const assignedCareerIds = await psychologistCareerService.getAssignedCareerIds(therapistId);
      const p = record.medicalRecord.patient;
      const isGeneral = PATIENT_TYPES_GENERAL.includes(p.patientType as any);
      const isStudentInScope =
        p.patientType === 'student' && assignedCareerIds.length > 0 && assignedCareerIds.includes(p.careerId);
      if (!isGeneral && !isStudentInScope) {
        throw new AppError('Access denied: you can only create sessions for your assigned careers or faculty/administrative', 403);
      }
    }

    const existing = await prisma.therapySession.findUnique({
      where: {
        psychologyRecordId_sessionNumber: {
          psychologyRecordId: data.psychologyRecordId,
          sessionNumber: data.sessionNumber,
        },
      },
    });
    if (existing) throw new AppError('A session with this number already exists for this psychology record', 409);

    return prisma.therapySession.create({
      data: {
        psychologyRecordId: data.psychologyRecordId,
        sessionNumber: data.sessionNumber,
        sessionDate: data.sessionDate,
        sessionDuration: data.sessionDuration ?? 50,
        mood: data.mood.trim(),
        evolutionNotes: data.evolutionNotes?.trim() || null,
        patientProgress: data.patientProgress?.trim() || null,
        assignedTasks: data.assignedTasks?.trim() || null,
        observations: data.observations?.trim() || null,
        nextSessionPlan: data.nextSessionPlan?.trim() || null,
        therapistId,
      },
      include: sessionInclude,
    });
  }

  async update(
    id: string,
    data: {
      sessionDate?: Date;
      sessionDuration?: number;
      mood?: string;
      evolutionNotes?: string;
      patientProgress?: string;
      assignedTasks?: string;
      observations?: string;
      nextSessionPlan?: string;
    },
    userId: string,
    userRole: string
  ) {
    await this.getById(id, userId, userRole);
    return prisma.therapySession.update({
      where: { id },
      data: {
        ...(data.sessionDate && { sessionDate: data.sessionDate }),
        ...(data.sessionDuration != null && { sessionDuration: data.sessionDuration }),
        ...(data.mood != null && { mood: data.mood.trim() }),
        ...(data.evolutionNotes !== undefined && { evolutionNotes: data.evolutionNotes?.trim() || null }),
        ...(data.patientProgress !== undefined && { patientProgress: data.patientProgress?.trim() || null }),
        ...(data.assignedTasks !== undefined && { assignedTasks: data.assignedTasks?.trim() || null }),
        ...(data.observations !== undefined && { observations: data.observations?.trim() || null }),
        ...(data.nextSessionPlan !== undefined && { nextSessionPlan: data.nextSessionPlan?.trim() || null }),
      },
      include: sessionInclude,
    });
  }
}

export default new TherapySessionService();
