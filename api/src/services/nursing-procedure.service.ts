import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { ROLES } from '../constants/roles';

const procedureListInclude = {
  consultation: {
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
                },
              },
            },
          },
        },
      },
    },
  },
  performedByUser: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
} as const;

export class NursingProcedureService {
  async getAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    procedureType?: string,
    patientId?: string,
    nursingConsultationId?: string,
    userRole?: string,
    userId?: string
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.NursingProcedureWhereInput = {};

    if (procedureType?.trim()) {
      where.procedureType = { contains: procedureType.trim(), mode: 'insensitive' };
    }

    if (nursingConsultationId) {
      where.nursingConsultationId = nursingConsultationId;
    }

    if (patientId) {
      where.consultation = {
        medicalRecord: { patientId },
      };
    }

    if (search?.trim()) {
      where.OR = [
        { procedureType: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
        {
          consultation: {
            medicalRecord: {
              patient: {
                user: {
                  OR: [
                    { firstName: { contains: search.trim(), mode: 'insensitive' } },
                    { lastName: { contains: search.trim(), mode: 'insensitive' } },
                    { email: { contains: search.trim(), mode: 'insensitive' } },
                  ],
                },
              },
            },
          },
        },
      ];
    }

    if (userRole === ROLES.ENFERMERO && userId) {
      where.performedBy = userId;
    }

    const [procedures, total] = await Promise.all([
      prisma.nursingProcedure.findMany({
        where,
        skip,
        take: limit,
        include: procedureListInclude,
        orderBy: { procedureDate: 'desc' },
      }),
      prisma.nursingProcedure.count({ where }),
    ]);

    return {
      procedures,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string, userRole?: string, userId?: string) {
    const procedure = await prisma.nursingProcedure.findUnique({
      where: { id },
      include: procedureListInclude,
    });

    if (!procedure) {
      throw new AppError('Nursing procedure not found', 404);
    }

    if (userRole === ROLES.ENFERMERO && userId && procedure.performedBy !== userId) {
      throw new AppError('Access denied to this procedure', 403);
    }

    return procedure;
  }

  async create(data: {
    nursingConsultationId: string;
    procedureType: string;
    procedureDate: Date;
    description: string;
    materialsUsed?: string;
    observations?: string;
    performedBy: string;
  }) {
    const consultation = await prisma.nursingConsultation.findUnique({
      where: { id: data.nursingConsultationId },
    });

    if (!consultation) {
      throw new AppError('Nursing consultation not found', 404);
    }

    const procedure = await prisma.nursingProcedure.create({
      data: {
        nursingConsultationId: data.nursingConsultationId,
        procedureType: data.procedureType,
        procedureDate: data.procedureDate,
        description: data.description,
        materialsUsed: data.materialsUsed,
        observations: data.observations,
        performedBy: data.performedBy,
      },
      include: procedureListInclude,
    });

    return procedure;
  }

  /**
   * Create a procedure for a patient. If the patient's medical record has no nursing consultation,
   * creates a minimal one (consultationDate = now, nurseId = performedBy), then creates the procedure.
   */
  async createFromPatient(
    patientId: string,
    performedBy: string,
    data: {
      procedureType: string;
      procedureDate: Date;
      description: string;
      materialsUsed?: string;
      observations?: string;
    }
  ) {
    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: { patientId },
      include: {
        nursingConsultations: {
          orderBy: { consultationDate: 'desc' },
          take: 1,
          select: { id: true },
        },
      },
    });

    if (!medicalRecord) {
      throw new AppError('Medical record not found for this patient', 404);
    }

    let consultationId: string | undefined =
      medicalRecord.nursingConsultations?.[0]?.id;

    if (!consultationId) {
      const newConsultation = await prisma.nursingConsultation.create({
        data: {
          medicalRecordId: medicalRecord.id,
          consultationDate: new Date(),
          nurseId: performedBy,
          chiefComplaint: null,
        },
        select: { id: true },
      });
      consultationId = newConsultation.id;
    }

    return this.create({
      nursingConsultationId: consultationId,
      procedureType: data.procedureType,
      procedureDate: data.procedureDate,
      description: data.description,
      materialsUsed: data.materialsUsed,
      observations: data.observations,
      performedBy,
    });
  }
}

export default new NursingProcedureService();
