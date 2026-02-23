import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { ROLES, ROLES_PSICOMETRIA, ROLES_CAN_DELETE_PSICOMETRIA } from '../constants/roles';
import psychologistCareerService from './psychologist-career.service';

const PATIENT_TYPES_GENERAL = ['faculty', 'administrative'] as const;

export class PsychometricTestService {
  async getAll(
    userId: string,
    userRole: string,
    page: number = 1,
    limit: number = 10,
    filters?: {
      psychologyRecordId?: string;
      evaluationType?: string;
      administeredBy?: string;
      applicationDateFrom?: Date;
      applicationDateTo?: Date;
    }
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.PsychometricEvaluationWhereInput = {};

    // Apply role-based filtering
    if (userRole === ROLES.PATIENT) {
      where.psychologyRecord = {
        medicalRecord: {
          patient: {
            userId,
          },
        },
      };
    } else if (userRole === ROLES.PSICOLOGO) {
      const assignedCareerIds = await psychologistCareerService.getAssignedCareerIds(userId);
      const patientScope: Prisma.PatientWhereInput = {
        OR: [
          { patientType: { in: [...PATIENT_TYPES_GENERAL] } },
          ...(assignedCareerIds.length ? [{ patientType: 'student', careerId: { in: assignedCareerIds } }] : []),
        ],
      };
      where.AND = [
        {
          OR: [
            { administeredBy: userId },
            { psychologyRecord: { assignedPsychologistId: userId } },
          ],
        },
        {
          psychologyRecord: {
            medicalRecord: { patient: patientScope },
          },
        },
      ];
    } else if (userRole === 'coordinador_enfermeria') {
      // Solo evaluaciones de pacientes con al menos una consulta de enfermería
      where.psychologyRecord = {
        medicalRecord: { nursingConsultations: { some: {} } },
      };
    }
    // Admin y coordinador psicología ven todas (sin filtro adicional)

    // Apply additional filters
    if (filters?.psychologyRecordId) {
      where.psychologyRecordId = filters.psychologyRecordId;
    }
    if (filters?.evaluationType) {
      where.evaluationType = { contains: filters.evaluationType, mode: 'insensitive' };
    }
    if (filters?.administeredBy) {
      where.administeredBy = filters.administeredBy;
    }
    if (filters?.applicationDateFrom || filters?.applicationDateTo) {
      where.applicationDate = {};
      if (filters.applicationDateFrom) {
        where.applicationDate.gte = filters.applicationDateFrom;
      }
      if (filters.applicationDateTo) {
        where.applicationDate.lte = filters.applicationDateTo;
      }
    }

    const [evaluations, total] = await Promise.all([
      prisma.psychometricEvaluation.findMany({
        where,
        skip,
        take: limit,
        include: {
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
          administeredByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { applicationDate: 'desc' },
      }),
      prisma.psychometricEvaluation.count({ where }),
    ]);

    return {
      evaluations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string, userId: string, userRole: string) {
    const evaluation = await prisma.psychometricEvaluation.findUnique({
      where: { id },
      include: {
        psychologyRecord: {
          include: {
            medicalRecord: {
              include: {
                nursingConsultations: { take: 1, select: { id: true } },
                patient: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        enrollmentNumber: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        administeredByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!evaluation) {
      throw new AppError('Psychometric evaluation not found', 404);
    }

    // Check access permissions
    if (userRole === ROLES.PATIENT) {
      // Check if the evaluation belongs to this patient's medical record
      if (evaluation.psychologyRecord.medicalRecord.patient.userId !== userId) {
        throw new AppError('Access denied', 403);
      }
    } else if (userRole === ROLES.PSICOLOGO) {
      if (
        evaluation.administeredBy !== userId &&
        evaluation.psychologyRecord.assignedPsychologistId !== userId
      ) {
        throw new AppError('Access denied', 403);
      }
      const patient = evaluation.psychologyRecord.medicalRecord.patient as { patientType: string; careerId: string };
      const assignedCareerIds = await psychologistCareerService.getAssignedCareerIds(userId);
      const isGeneral = PATIENT_TYPES_GENERAL.includes(patient.patientType as (typeof PATIENT_TYPES_GENERAL)[number]);
      const isStudentInScope =
        patient.patientType === 'student' && assignedCareerIds.length > 0 && assignedCareerIds.includes(patient.careerId);
      if (!isGeneral && !isStudentInScope) {
        throw new AppError(
          'Acceso denegado: solo puede ver evaluaciones de estudiantes de sus carreras asignadas o personal docente/administrativo',
          403
        );
      }
    } else if (userRole === 'coordinador_enfermeria') {
      const hasNursing = (evaluation.psychologyRecord.medicalRecord as { nursingConsultations?: { id: string }[] })
        ?.nursingConsultations?.length;
      if (!hasNursing) {
        throw new AppError('Acceso denegado: solo puede ver evaluaciones de pacientes registrados en enfermería', 403);
      }
    }

    return evaluation;
  }

  async create(data: {
    psychologyRecordId: string;
    evaluationType: string;
    applicationDate: Date;
    rawScore?: number;
    standardScore?: number;
    percentile?: number;
    interpretation?: string;
    administeredBy: string;
    fileUrl?: string;
  }) {
    // Verify psychology record exists
    const psychologyRecord = await prisma.psychologyRecord.findUnique({
      where: { id: data.psychologyRecordId },
    });

    if (!psychologyRecord) {
      throw new AppError('Psychology record not found', 404);
    }

    // Verify user exists and is authorized
    const user = await prisma.user.findUnique({
      where: { id: data.administeredBy },
    });

    if (!user) {
      throw new AppError('Administering user not found', 404);
    }

    if (!ROLES_PSICOMETRIA.includes(user.role as any)) {
      throw new AppError('Solo psicólogos (y coordinador/admin) pueden aplicar evaluaciones', 403);
    }

    if (user.role === ROLES.PSICOLOGO) {
      const recordWithPatient = await prisma.psychologyRecord.findUnique({
        where: { id: data.psychologyRecordId },
        include: { medicalRecord: { include: { patient: true } } },
      });
      const patient = recordWithPatient?.medicalRecord?.patient;
      if (patient) {
        const assignedCareerIds = await psychologistCareerService.getAssignedCareerIds(data.administeredBy);
        const isGeneral = PATIENT_TYPES_GENERAL.includes(patient.patientType as (typeof PATIENT_TYPES_GENERAL)[number]);
        const isStudentInScope =
          patient.patientType === 'student' && assignedCareerIds.length > 0 && assignedCareerIds.includes(patient.careerId);
        if (!isGeneral && !isStudentInScope) {
          throw new AppError(
            'Solo puede crear evaluaciones para estudiantes de sus carreras asignadas o personal docente/administrativo',
            403
          );
        }
      }
    }

    const evaluation = await prisma.psychometricEvaluation.create({
      data: {
        psychologyRecordId: data.psychologyRecordId,
        evaluationType: data.evaluationType,
        applicationDate: data.applicationDate,
        rawScore: data.rawScore,
        standardScore: data.standardScore,
        percentile: data.percentile,
        interpretation: data.interpretation,
        administeredBy: data.administeredBy,
        fileUrl: data.fileUrl,
      },
      include: {
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
        administeredByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return evaluation;
  }

  async update(
    id: string,
    userId: string,
    userRole: string,
    data: {
      evaluationType?: string;
      applicationDate?: Date;
      rawScore?: number;
      standardScore?: number;
      percentile?: number;
      interpretation?: string;
      fileUrl?: string;
    }
  ) {
    // Check if evaluation exists
    const existingEvaluation = await prisma.psychometricEvaluation.findUnique({
      where: { id },
      include: {
        psychologyRecord: true,
      },
    });

    if (!existingEvaluation) {
      throw new AppError('Psychometric evaluation not found', 404);
    }

    // Check permissions - only the psychologist who administered it or assigned psychologist can update
    if (userRole === ROLES.PSICOLOGO) {
      if (
        existingEvaluation.administeredBy !== userId &&
        existingEvaluation.psychologyRecord.assignedPsychologistId !== userId
      ) {
        throw new AppError('Access denied', 403);
      }
    } else if (!ROLES_PSICOMETRIA.includes(userRole as any)) {
      throw new AppError('Insufficient permissions', 403);
    }

    const evaluation = await prisma.psychometricEvaluation.update({
      where: { id },
      data: {
        evaluationType: data.evaluationType,
        applicationDate: data.applicationDate,
        rawScore: data.rawScore,
        standardScore: data.standardScore,
        percentile: data.percentile,
        interpretation: data.interpretation,
        fileUrl: data.fileUrl,
        updatedAt: new Date(),
      },
      include: {
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
        administeredByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return evaluation;
  }

  async delete(id: string, _userId: string, userRole: string) {
    // Check if evaluation exists
    const existingEvaluation = await prisma.psychometricEvaluation.findUnique({
      where: { id },
      include: {
        psychologyRecord: true,
      },
    });

    if (!existingEvaluation) {
      throw new AppError('Psychometric evaluation not found', 404);
    }

    // Only admin and coordinators can delete evaluations
    if (!ROLES_CAN_DELETE_PSICOMETRIA.includes(userRole as any)) {
      throw new AppError('Insufficient permissions to delete evaluations', 403);
    }

    await prisma.psychometricEvaluation.delete({
      where: { id },
    });

    return { message: 'Psychometric evaluation deleted successfully' };
  }
}

export default new PsychometricTestService();
