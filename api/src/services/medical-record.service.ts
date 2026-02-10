import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

// Common include configuration for detailed medical record queries
const detailedMedicalRecordInclude: Prisma.MedicalRecordInclude = {
  patient: {
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
      emergencyContacts: true,
    },
  },
  createdByUser: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  },
  updatedByUser: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
    },
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

export class MedicalRecordService {
  async getAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.MedicalRecordWhereInput = {};

    if (search) {
      where.patient = {
        user: {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { enrollmentNumber: { contains: search, mode: 'insensitive' } },
          ],
        },
      };
    }

    const [medicalRecords, total] = await Promise.all([
      prisma.medicalRecord.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  dateOfBirth: true,
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
          },
          createdByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          updatedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
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

  async getById(id: string) {
    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: { id },
      include: detailedMedicalRecordInclude,
    });

    if (!medicalRecord) {
      throw new AppError('Medical record not found', 404);
    }

    return medicalRecord;
  }

  async getByPatientId(patientId: string) {
    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: { patientId },
      include: detailedMedicalRecordInclude,
    });

    if (!medicalRecord) {
      throw new AppError('Medical record not found for this patient', 404);
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
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                dateOfBirth: true,
                enrollmentNumber: true,
              },
            },
            career: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return medicalRecord;
  }

  async update(id: string, data: {
    bloodType?: string;
    allergies?: string;
    chronicConditions?: string;
    currentMedications?: string;
    familyHistory?: string;
    notes?: string;
    updatedBy: string;
  }) {
    const medicalRecord = await prisma.medicalRecord.findUnique({ where: { id } });

    if (!medicalRecord) {
      throw new AppError('Medical record not found', 404);
    }

    const updatedRecord = await prisma.medicalRecord.update({
      where: { id },
      data,
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                dateOfBirth: true,
                enrollmentNumber: true,
              },
            },
            career: true,
          },
        },
        updatedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return updatedRecord;
  }
}

export default new MedicalRecordService();
