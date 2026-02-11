import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { INTERCONSULTATION_STATUS } from '../constants/interconsultation';

export class InterconsultationService {
  async getAll(
    userId: string,
    userRole: string,
    page: number = 1,
    limit: number = 10,
    filters?: {
      patientId?: string;
      fromDepartment?: string;
      toDepartment?: string;
      status?: string;
      urgency?: string;
      fromProfessionalId?: string;
      toProfessionalId?: string;
    }
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.InterconsultationWhereInput = {};

    // Apply role-based filtering
    if (userRole === 'patient') {
      // Patients can see their own interconsultations
      const patient = await prisma.patient.findUnique({
        where: { userId },
      });
      if (!patient) {
        throw new AppError('Patient profile not found', 404);
      }
      where.patientId = patient.id;
    } else if (userRole === 'psychologist' || userRole === 'nurse') {
      // Professionals can see interconsultations where they are involved
      where.OR = [
        { fromProfessionalId: userId },
        { toProfessionalId: userId },
        { respondedBy: userId },
      ];
    }
    // Admins and coordinators can see all interconsultations (no additional filter)

    // Apply additional filters
    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }
    if (filters?.fromDepartment) {
      where.fromDepartment = filters.fromDepartment;
    }
    if (filters?.toDepartment) {
      where.toDepartment = filters.toDepartment;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.urgency) {
      where.urgency = filters.urgency;
    }
    if (filters?.fromProfessionalId) {
      where.fromProfessionalId = filters.fromProfessionalId;
    }
    if (filters?.toProfessionalId) {
      where.toProfessionalId = filters.toProfessionalId;
    }

    const [interconsultations, total] = await Promise.all([
      prisma.interconsultation.findMany({
        where,
        skip,
        take: limit,
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
          fromProfessional: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          toProfessional: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          respondedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.interconsultation.count({ where }),
    ]);

    return {
      interconsultations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string, userId: string, userRole: string) {
    const interconsultation = await prisma.interconsultation.findUnique({
      where: { id },
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
        fromProfessional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        toProfessional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        respondedByUser: {
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

    if (!interconsultation) {
      throw new AppError('Interconsultation not found', 404);
    }

    // Check access permissions
    if (userRole === 'patient') {
      const patient = await prisma.patient.findUnique({
        where: { userId },
      });
      if (!patient || interconsultation.patientId !== patient.id) {
        throw new AppError('Access denied', 403);
      }
    } else if (userRole === 'psychologist' || userRole === 'nurse') {
      if (
        interconsultation.fromProfessionalId !== userId &&
        interconsultation.toProfessionalId !== userId &&
        interconsultation.respondedBy !== userId
      ) {
        throw new AppError('Access denied', 403);
      }
    }

    return interconsultation;
  }

  async create(data: {
    patientId: string;
    fromDepartment: string;
    toDepartment: string;
    fromProfessionalId: string;
    toProfessionalId?: string;
    reason: string;
    relevantInformation?: string;
    urgency: string;
  }) {
    // Validate patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId },
    });
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    // Validate fromProfessional exists
    const fromProfessional = await prisma.user.findUnique({
      where: { id: data.fromProfessionalId },
    });
    if (!fromProfessional) {
      throw new AppError('From professional not found', 404);
    }
    if (!['psychologist', 'nurse', 'admin', 'coordinator'].includes(fromProfessional.role)) {
      throw new AppError('Invalid from professional role', 400);
    }

    // Validate toProfessional if specified
    if (data.toProfessionalId) {
      const toProfessional = await prisma.user.findUnique({
        where: { id: data.toProfessionalId },
      });
      if (!toProfessional) {
        throw new AppError('To professional not found', 404);
      }
      if (!['psychologist', 'nurse', 'admin', 'coordinator'].includes(toProfessional.role)) {
        throw new AppError('Invalid to professional role', 400);
      }
    }

    // Create interconsultation
    const interconsultation = await prisma.interconsultation.create({
      data: {
        patientId: data.patientId,
        fromDepartment: data.fromDepartment,
        toDepartment: data.toDepartment,
        fromProfessionalId: data.fromProfessionalId,
        toProfessionalId: data.toProfessionalId,
        reason: data.reason,
        relevantInformation: data.relevantInformation,
        urgency: data.urgency,
        status: INTERCONSULTATION_STATUS.PENDING,
      },
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
              },
            },
          },
        },
        fromProfessional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        toProfessional: {
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

    return interconsultation;
  }

  async addResponse(
    id: string,
    userId: string,
    userRole: string,
    response: string
  ) {
    const interconsultation = await prisma.interconsultation.findUnique({
      where: { id },
    });

    if (!interconsultation) {
      throw new AppError('Interconsultation not found', 404);
    }

    // Check permissions - only professionals from target department or assigned professional can respond
    if (userRole === 'patient') {
      throw new AppError('Patients cannot respond to interconsultations', 403);
    }

    // Validate that the user is authorized to respond
    if (userRole !== 'admin' && userRole !== 'coordinator') {
      if (interconsultation.toProfessionalId && interconsultation.toProfessionalId !== userId) {
        throw new AppError('Only the assigned professional can respond to this interconsultation', 403);
      }
    }

    // Check if already responded
    if (interconsultation.status === INTERCONSULTATION_STATUS.RESPONDED) {
      throw new AppError('This interconsultation has already been responded to', 400);
    }

    // Check if cancelled
    if (interconsultation.status === INTERCONSULTATION_STATUS.CANCELLED) {
      throw new AppError('Cannot respond to a cancelled interconsultation', 400);
    }

    // Update interconsultation with response
    const updatedInterconsultation = await prisma.interconsultation.update({
      where: { id },
      data: {
        response,
        respondedBy: userId,
        respondedAt: new Date(),
        status: INTERCONSULTATION_STATUS.RESPONDED,
        updatedAt: new Date(),
      },
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
              },
            },
          },
        },
        fromProfessional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        toProfessional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        respondedByUser: {
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

    return updatedInterconsultation;
  }
}

export default new InterconsultationService();
