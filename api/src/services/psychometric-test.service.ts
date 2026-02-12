import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

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
    if (userRole === 'patient') {
      // Patients can see their own psychometric evaluations
      // Use nested where clause to filter in a single query
      where.psychologyRecord = {
        medicalRecord: {
          patient: {
            userId,
          },
        },
      };
    } else if (userRole === 'psychologist') {
      // Psychologists can see evaluations they administered or for patients assigned to them
      where.OR = [
        { administeredBy: userId },
        {
          psychologyRecord: {
            assignedPsychologistId: userId,
          },
        },
      ];
    }
    // Admins and coordinators can see all evaluations (no additional filter)

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
    if (userRole === 'patient') {
      // Check if the evaluation belongs to this patient's medical record
      if (evaluation.psychologyRecord.medicalRecord.patient.userId !== userId) {
        throw new AppError('Access denied', 403);
      }
    } else if (userRole === 'psychologist') {
      if (
        evaluation.administeredBy !== userId &&
        evaluation.psychologyRecord.assignedPsychologistId !== userId
      ) {
        throw new AppError('Access denied', 403);
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

    if (user.role !== 'psychologist' && user.role !== 'admin' && user.role !== 'coordinador_psicologia') {
      throw new AppError('Only psychologists can administer evaluations', 403);
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
    if (userRole === 'psychologist') {
      if (
        existingEvaluation.administeredBy !== userId &&
        existingEvaluation.psychologyRecord.assignedPsychologistId !== userId
      ) {
        throw new AppError('Access denied', 403);
      }
    } else if (userRole !== 'admin' && userRole !== 'coordinador_psicologia') {
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
    if (userRole !== 'admin' && userRole !== 'coordinador_psicologia') {
      throw new AppError('Insufficient permissions to delete evaluations', 403);
    }

    await prisma.psychometricEvaluation.delete({
      where: { id },
    });

    return { message: 'Psychometric evaluation deleted successfully' };
  }
}

export default new PsychometricTestService();
