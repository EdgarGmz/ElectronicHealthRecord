import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import type { Prisma } from '@prisma/client';

export interface CreateNursingAttentionInput {
  patientId: string;
  nurseId: string;
  motiveAtencion: string;
  signosVitales?: {
    presionArterialSys?: number;
    presionArterialDia?: number;
    temperatura?: number;
    frecuenciaCardiaca?: number;
    spo2?: number;
  };
  diagnosticoRelampago?: string;
  tratamientoAplicado?: string;
  observaciones?: string;
  derivacion?: string;
}

export interface ListNursingAttentionsFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  disposition?: string;
  /** When set, filter by patient. Coordinator sees all attentions for patient; nurse sees only their own. */
  patientId?: string;
}

class NursingAttentionService {
  async listForNurse(nurseId: string, filters?: ListNursingAttentionsFilters, isCoordinator = false) {
    const where: Prisma.NursingAttentionWhereInput = {};
    if (!isCoordinator) {
      where.nurseId = nurseId;
    }
    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }

    const search = (filters?.search ?? '').trim();
    if (search && !filters?.patientId) {
      const q = search.toLowerCase();
      const patients = await prisma.patient.findMany({
        where: {
          user: {
            OR: [
              { firstName: { contains: q, mode: 'insensitive' } },
              { lastName: { contains: q, mode: 'insensitive' } },
              { enrollmentNumber: { contains: q, mode: 'insensitive' } },
            ],
          },
        },
        select: { id: true },
      });
      const patientIds = patients.map((p) => p.id);
      if (patientIds.length === 0) {
        return [];
      }
      where.patientId = { in: patientIds };
    }

    const dateFrom = (filters?.dateFrom ?? '').trim();
    const dateTo = (filters?.dateTo ?? '').trim();
    if (dateFrom || dateTo) {
      const createdAt: Prisma.DateTimeFilter = {};
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        createdAt.gte = from;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        createdAt.lte = to;
      }
      where.createdAt = createdAt;
    }

    const disposition = (filters?.disposition ?? '').trim();
    if (disposition) {
      where.disposition = disposition;
    }

    const attentions = await prisma.nursingAttention.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    if (attentions.length === 0) return [];

    const patientIds = [...new Set(attentions.map((a) => a.patientId))];
    const patients = await prisma.patient.findMany({
      where: { id: { in: patientIds } },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            enrollmentNumber: true,
          },
        },
      },
    });
    const patientMap = new Map(patients.map((p) => [p.id, p]));

    return attentions.map((a) => {
      const patient = patientMap.get(a.patientId);
      const enrollmentNumber = patient?.user?.enrollmentNumber ?? null;
      return {
        id: a.id,
        patientId: a.patientId,
        motive: a.motive,
        disposition: a.disposition,
        createdAt: a.createdAt,
        patient: patient
          ? {
              user: {
                firstName: patient.user.firstName ?? '',
                lastName: patient.user.lastName ?? '',
                enrollmentNumber,
              },
            }
          : { user: { firstName: '', lastName: '', enrollmentNumber: null } },
      };
    });
  }

  async getById(id: string, nurseId: string, canBypassNurseCheck = false) {
    const attention = await prisma.nursingAttention.findUnique({
      where: { id },
      select: {
        id: true,
        patientId: true,
        nurseId: true,
        motive: true,
        vitalSigns: true,
        lightningDiagnosis: true,
        treatment: true,
        observations: true,
        disposition: true,
        createdAt: true,
      },
    });

    if (!attention) {
      throw new AppError('Nursing attention not found', 404);
    }

    if (!canBypassNurseCheck && attention.nurseId !== nurseId) {
      throw new AppError('Access denied to this attention', 403);
    }

    const patient = await prisma.patient.findUnique({
      where: { id: attention.patientId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            enrollmentNumber: true,
            email: true,
          },
        },
      },
    })

    return {
      id: attention.id,
      patientId: attention.patientId,
      motive: attention.motive,
      disposition: attention.disposition,
      vitalSigns: attention.vitalSigns,
      lightningDiagnosis: attention.lightningDiagnosis,
      treatment: attention.treatment,
      observations: attention.observations,
      createdAt: attention.createdAt,
      patient: attention.patient
        ? patient
          ? {
              user: {
                firstName: patient.user.firstName ?? '',
                lastName: patient.user.lastName ?? '',
                enrollmentNumber: patient.user.enrollmentNumber ?? null,
                email: patient.user.email ?? '',
              },
            }
          : undefined
        : undefined,
    };
  }

  async create(input: CreateNursingAttentionInput) {
    const patient = await prisma.patient.findUnique({ where: { id: input.patientId } });
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    const nurse = await prisma.user.findUnique({ where: { id: input.nurseId } });
    if (!nurse) {
      throw new AppError('Nurse user not found', 404);
    }

    const attention = await prisma.nursingAttention.create({
      data: {
        patientId: input.patientId,
        nurseId: input.nurseId,
        motive: input.motiveAtencion,
        vitalSigns: input.signosVitales ?? undefined,
        lightningDiagnosis: input.diagnosticoRelampago ?? null,
        treatment: input.tratamientoAplicado ?? null,
        observations: input.observaciones ?? null,
        disposition: input.derivacion ?? null,
      },
    });

    return attention;
  }
}

export default new NursingAttentionService();

