import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { PRESCRIPTION_STATUS, PRESCRIPTION_STATUS_VALUES } from '../utils/constants';

export class MedicationService {
  // Medication Catalog Management
  async getAllMedications(page: number = 1, limit: number = 10, search?: string, category?: string, isActive?: boolean) {
    const skip = (page - 1) * limit;

    const where: Prisma.MedicationWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { genericName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [medications, total] = await Promise.all([
      prisma.medication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.medication.count({ where }),
    ]);

    return {
      medications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMedicationById(id: string) {
    const medication = await prisma.medication.findUnique({
      where: { id },
      include: {
        prescriptions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            patient: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    enrollmentNumber: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!medication) {
      throw new AppError('Medication not found', 404);
    }

    return medication;
  }

  async createMedication(data: {
    name: string;
    genericName: string;
    category?: string;
    dosageForms?: string;
    commonDosages?: string;
    administrationRoutes?: string;
    contraindications?: string;
    sideEffects?: string;
  }) {
    // Check for duplicate medication
    const existing = await prisma.medication.findFirst({
      where: {
        name: data.name,
        genericName: data.genericName,
      },
    });

    if (existing) {
      throw new AppError('Medication with this name and generic name already exists', 409);
    }

    const medication = await prisma.medication.create({
      data,
    });

    return medication;
  }

  async updateMedication(id: string, data: {
    name?: string;
    genericName?: string;
    category?: string;
    dosageForms?: string;
    commonDosages?: string;
    administrationRoutes?: string;
    contraindications?: string;
    sideEffects?: string;
    isActive?: boolean;
  }) {
    const existing = await prisma.medication.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Medication not found', 404);
    }

    const medication = await prisma.medication.update({
      where: { id },
      data,
    });

    return medication;
  }

  // Prescription Management
  async getAllPrescriptions(
    page: number = 1,
    limit: number = 10,
    patientId?: string,
    prescribedBy?: string,
    status?: string
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.PrescriptionWhereInput = {};

    if (patientId) {
      where.patientId = patientId;
    }

    if (prescribedBy) {
      where.prescribedBy = prescribedBy;
    }

    if (status) {
      where.status = status;
    }

    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
        where,
        skip,
        take: limit,
        include: {
          medication: {
            select: {
              id: true,
              name: true,
              genericName: true,
              category: true,
            },
          },
          patient: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  enrollmentNumber: true,
                },
              },
            },
          },
          prescribedByUser: {
            select: {
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.prescription.count({ where }),
    ]);

    return {
      prescriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPrescriptionById(id: string) {
    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        medication: true,
        patient: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                enrollmentNumber: true,
                dateOfBirth: true,
              },
            },
            medicalRecord: {
              select: {
                allergies: true,
                chronicConditions: true,
                currentMedications: true,
              },
            },
          },
        },
        prescribedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        administrations: {
          include: {
            medicationAdministration: {
              include: {
                administeredByUser: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!prescription) {
      throw new AppError('Prescription not found', 404);
    }

    return prescription;
  }

  async createPrescription(data: {
    patientId: string;
    medicationId: string;
    prescribedBy: string;
    dosage: string;
    frequency: string;
    route: string;
    duration?: string;
    startDate: Date;
    endDate?: Date;
    instructions?: string;
  }) {
    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId },
      include: {
        medicalRecord: {
          select: {
            allergies: true,
          },
        },
      },
    });

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    // Verify medication exists
    const medication = await prisma.medication.findUnique({
      where: { id: data.medicationId },
    });

    if (!medication) {
      throw new AppError('Medication not found', 404);
    }

    if (!medication.isActive) {
      throw new AppError('Medication is not active', 400);
    }

    // Check for contraindications/allergies (basic check)
    if (patient.medicalRecord?.allergies && medication.contraindications) {
      const allergies = patient.medicalRecord.allergies.toLowerCase();
      const contraindications = medication.contraindications.toLowerCase();
      const medicationName = medication.name.toLowerCase();
      const genericName = medication.genericName.toLowerCase();

      // Tokenize allergies and contraindications for better matching
      const allergyTokens = allergies.split(/[,;]/).map(a => a.trim()).filter(a => a.length > 0);
      const contraindicationTokens = contraindications.split(/[,;]/).map(c => c.trim()).filter(c => c.length > 0);

      // Check if medication name or generic name is in allergies
      const hasMedicationAllergy = allergyTokens.some(allergy => 
        medicationName.includes(allergy) || genericName.includes(allergy)
      );

      // Check if any allergy matches any contraindication
      const hasContraindication = allergyTokens.some(allergy =>
        contraindicationTokens.some(contraindication => 
          contraindication.includes(allergy) || allergy.includes(contraindication)
        )
      );

      if (hasMedicationAllergy || hasContraindication) {
        throw new AppError(
          `Warning: Potential allergy or contraindication detected for this medication. Patient allergies: ${patient.medicalRecord.allergies}`,
          400
        );
      }
    }

    const prescription = await prisma.prescription.create({
      data: {
        patientId: data.patientId,
        medicationId: data.medicationId,
        prescribedBy: data.prescribedBy,
        dosage: data.dosage,
        frequency: data.frequency,
        route: data.route,
        duration: data.duration,
        startDate: data.startDate,
        endDate: data.endDate,
        instructions: data.instructions,
        status: PRESCRIPTION_STATUS.ACTIVE,
      },
      include: {
        medication: true,
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                enrollmentNumber: true,
              },
            },
          },
        },
        prescribedByUser: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return prescription;
  }

  async updatePrescriptionStatus(id: string, status: string) {
    const prescription = await prisma.prescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      throw new AppError('Prescription not found', 404);
    }

    if (!PRESCRIPTION_STATUS_VALUES.includes(status as any)) {
      throw new AppError(`Invalid status. Must be one of: ${PRESCRIPTION_STATUS_VALUES.join(', ')}`, 400);
    }

    const updated = await prisma.prescription.update({
      where: { id },
      data: { status },
      include: {
        medication: true,
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return updated;
  }

  // Medication Administration (connected to prescriptions)
  async createPrescriptionAdministration(data: {
    prescriptionId: string;
    nursingConsultationId: string;
    administeredBy: string;
    administrationDate: Date;
    patientVerified: boolean;
    medicationVerified: boolean;
    dosageVerified: boolean;
    routeVerified: boolean;
    timeVerified: boolean;
    adverseReaction?: string;
    observations?: string;
  }) {
    // Verify prescription exists and is active
    const prescription = await prisma.prescription.findUnique({
      where: { id: data.prescriptionId },
      include: {
        medication: true,
      },
    });

    if (!prescription) {
      throw new AppError('Prescription not found', 404);
    }

    if (prescription.status !== PRESCRIPTION_STATUS.ACTIVE) {
      throw new AppError('Prescription is not active', 400);
    }

    // Verify nursing consultation exists
    const consultation = await prisma.nursingConsultation.findUnique({
      where: { id: data.nursingConsultationId },
    });

    if (!consultation) {
      throw new AppError('Nursing consultation not found', 404);
    }

    // Verify all 5 correctos are verified
    if (
      !data.patientVerified ||
      !data.medicationVerified ||
      !data.dosageVerified ||
      !data.routeVerified ||
      !data.timeVerified
    ) {
      throw new AppError('All 5 verification checks (5 Correctos) must be completed before administering medication', 400);
    }

    // Create medication administration and link to prescription in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const medicationAdmin = await tx.medicationAdministration.create({
        data: {
          nursingConsultationId: data.nursingConsultationId,
          medicationId: prescription.medicationId,
          dosage: prescription.dosage,
          route: prescription.route,
          administrationDate: data.administrationDate,
          administeredBy: data.administeredBy,
          patientVerified: data.patientVerified,
          medicationVerified: data.medicationVerified,
          dosageVerified: data.dosageVerified,
          routeVerified: data.routeVerified,
          timeVerified: data.timeVerified,
          adverseReaction: data.adverseReaction,
          observations: data.observations,
        },
      });

      const prescriptionAdmin = await tx.prescriptionAdministration.create({
        data: {
          prescriptionId: data.prescriptionId,
          medicationAdministrationId: medicationAdmin.id,
        },
      });

      return {
        medicationAdmin,
        prescriptionAdmin,
      };
    });

    return result;
  }
}

export default new MedicationService();
