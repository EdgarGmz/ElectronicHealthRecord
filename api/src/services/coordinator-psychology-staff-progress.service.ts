import prisma from '../config/database';
import { ROLES } from '../constants/roles';
import { APPOINTMENT_STATUS } from '../constants/appointment';

const DEPARTMENT_PSYCHOLOGY = 'psychology';

export type StaffProgressPeriod = 'week' | 'month' | 'year';

export interface StaffProgressItem {
  psychologistId: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  patientsAttended: number;
  recordsCount: number;
  sessionsCount: number;
  appointmentsCompleted: number;
  appointmentsCancelled: number;
  appointmentsScheduled: number;
}

function getDateRange(period: StaffProgressPeriod): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  if (period === 'week') {
    start.setDate(start.getDate() - 7);
  } else if (period === 'month') {
    start.setMonth(start.getMonth() - 1);
  } else {
    start.setFullYear(start.getFullYear() - 1);
  }
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

export async function getStaffProgress(period: StaffProgressPeriod = 'month'): Promise<StaffProgressItem[]> {
  const { start, end } = getDateRange(period);

  const psychologists = await prisma.user.findMany({
    where: { role: ROLES.PSICOLOGO },
    select: { id: true, firstName: true, lastName: true, isActive: true },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  });

  if (psychologists.length === 0) return [];

  const ids = psychologists.map((p) => p.id);

  const [
    recordsCountByPsychologist,
    sessionsInPeriod,
    appointmentsInPeriod,
    patientIdsFromSessions,
  ] = await Promise.all([
    prisma.psychologyRecord.groupBy({
      by: ['assignedPsychologistId'],
      where: { assignedPsychologistId: { in: ids } },
      _count: true,
    }),
    prisma.therapySession.findMany({
      where: {
        therapistId: { in: ids },
        sessionDate: { gte: start, lte: end },
      },
      select: { therapistId: true },
    }),
    prisma.appointment.findMany({
      where: {
        department: DEPARTMENT_PSYCHOLOGY,
        professionalId: { in: ids },
        scheduledDate: { gte: start, lte: end },
      },
      select: { professionalId: true, status: true, patientId: true },
    }),
    prisma.therapySession.findMany({
      where: {
        therapistId: { in: ids },
        sessionDate: { gte: start, lte: end },
      },
      select: {
        therapistId: true,
        psychologyRecord: { select: { medicalRecord: { select: { patientId: true } } } },
      },
    }),
  ]);

  const recordsMap = new Map<string, number>();
  for (const r of recordsCountByPsychologist) {
    if (r.assignedPsychologistId) recordsMap.set(r.assignedPsychologistId, r._count);
  }

  const sessionsCountByTherapist = new Map<string, number>();
  for (const s of sessionsInPeriod) {
    sessionsCountByTherapist.set(s.therapistId, (sessionsCountByTherapist.get(s.therapistId) ?? 0) + 1);
  }

  const appointmentsByProfessional = new Map<string, { completed: number; cancelled: number; scheduled: number }>();
  const patientsByProfessional = new Map<string, Set<string>>();
  for (const a of appointmentsInPeriod) {
    const key = a.professionalId;
    if (!appointmentsByProfessional.has(key)) {
      appointmentsByProfessional.set(key, { completed: 0, cancelled: 0, scheduled: 0 });
    }
    const agg = appointmentsByProfessional.get(key)!;
    if (a.status === APPOINTMENT_STATUS.COMPLETED) agg.completed += 1;
    else if (a.status === APPOINTMENT_STATUS.CANCELLED || a.status === APPOINTMENT_STATUS.NO_SHOW) agg.cancelled += 1;
    else agg.scheduled += 1;

    if (a.status === APPOINTMENT_STATUS.COMPLETED || a.status === APPOINTMENT_STATUS.SCHEDULED || a.status === APPOINTMENT_STATUS.CONFIRMED) {
      if (!patientsByProfessional.has(key)) patientsByProfessional.set(key, new Set());
      patientsByProfessional.get(key)!.add(a.patientId);
    }
  }

  for (const s of patientIdsFromSessions) {
    const therapistId = s.therapistId;
    const patientId = s.psychologyRecord?.medicalRecord?.patientId;
    if (patientId) {
      if (!patientsByProfessional.has(therapistId)) patientsByProfessional.set(therapistId, new Set());
      patientsByProfessional.get(therapistId)!.add(patientId);
    }
  }

  return psychologists.map((p) => {
    const recordsCount = recordsMap.get(p.id) ?? 0;
    const sessionsCount = sessionsCountByTherapist.get(p.id) ?? 0;
    const appAgg = appointmentsByProfessional.get(p.id) ?? { completed: 0, cancelled: 0, scheduled: 0 };
    const patientsSet = patientsByProfessional.get(p.id);
    const patientsAttended = patientsSet ? patientsSet.size : 0;
    return {
      psychologistId: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      isActive: p.isActive,
      patientsAttended,
      recordsCount,
      sessionsCount,
      appointmentsCompleted: appAgg.completed,
      appointmentsCancelled: appAgg.cancelled,
      appointmentsScheduled: appAgg.scheduled,
    };
  });
}
