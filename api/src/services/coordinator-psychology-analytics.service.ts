import prisma from '../config/database';
import { ROLES } from '../constants/roles';

const DEPARTMENT_PSYCHOLOGY = 'psychology';

export type GroupBy = 'day' | 'week' | 'month';

export interface ConsultationsOverTimeItem {
  date: string;
  appointments: number;
  sessions: number;
  total: number;
}

export interface WorkloadDistributionItem {
  psychologistId: string;
  psychologistName: string;
  patientsCount: number;
  sessionsCount: number;
  appointmentsCompleted: number;
  hoursApprox: number;
}

function formatDateKey(d: Date, groupBy: GroupBy): string {
  if (groupBy === 'day') {
    return d.toISOString().slice(0, 10);
  }
  if (groupBy === 'month') {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  // week: ISO week Monday
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - (day === 0 ? 6 : day - 1);
  date.setDate(diff);
  return date.toISOString().slice(0, 10);
}

export async function getConsultationsOverTime(
  start: Date,
  end: Date,
  groupBy: GroupBy,
  psychologistId?: string
): Promise<ConsultationsOverTimeItem[]> {
  const professionalFilter = psychologistId ? { professionalId: psychologistId } : {};
  const therapistFilter = psychologistId ? { therapistId: psychologistId } : {};

  const [appointments, sessions] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        department: DEPARTMENT_PSYCHOLOGY,
        scheduledDate: { gte: start, lte: end },
        ...professionalFilter,
      },
      select: { scheduledDate: true },
    }),
    prisma.therapySession.findMany({
      where: {
        sessionDate: { gte: start, lte: end },
        ...therapistFilter,
      },
      select: { sessionDate: true, sessionDuration: true },
    }),
  ]);

  const byKey: Record<string, { appointments: number; sessions: number }> = {};

  for (const a of appointments) {
    const key = formatDateKey(new Date(a.scheduledDate), groupBy);
    if (!byKey[key]) byKey[key] = { appointments: 0, sessions: 0 };
    byKey[key].appointments += 1;
  }
  for (const s of sessions) {
    const key = formatDateKey(new Date(s.sessionDate), groupBy);
    if (!byKey[key]) byKey[key] = { appointments: 0, sessions: 0 };
    byKey[key].sessions += 1;
  }

  const keys = Object.keys(byKey).sort();
  return keys.map((date) => ({
    date,
    appointments: byKey[date].appointments,
    sessions: byKey[date].sessions,
    total: byKey[date].appointments + byKey[date].sessions,
  }));
}

export async function getWorkloadDistribution(
  start: Date,
  end: Date
): Promise<WorkloadDistributionItem[]> {
  const psychologists = await prisma.user.findMany({
    where: { role: ROLES.PSICOLOGO },
    select: { id: true, firstName: true, lastName: true },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  });

  if (psychologists.length === 0) return [];

  const ids = psychologists.map((p) => p.id);

  const [sessionsGrouped, appointmentsGrouped, patientIdsFromSessions, patientIdsFromAppointments] =
    await Promise.all([
      prisma.therapySession.groupBy({
        by: ['therapistId'],
        where: { therapistId: { in: ids }, sessionDate: { gte: start, lte: end } },
        _count: true,
        _sum: { sessionDuration: true },
      }),
      prisma.appointment.groupBy({
        by: ['professionalId'],
        where: {
          department: DEPARTMENT_PSYCHOLOGY,
          professionalId: { in: ids },
          scheduledDate: { gte: start, lte: end },
          status: 'completed',
        },
        _count: true,
      }),
      prisma.therapySession.findMany({
        where: { therapistId: { in: ids }, sessionDate: { gte: start, lte: end } },
        select: {
          therapistId: true,
          psychologyRecord: { select: { medicalRecord: { select: { patientId: true } } } },
        },
      }),
      prisma.appointment.findMany({
        where: {
          department: DEPARTMENT_PSYCHOLOGY,
          professionalId: { in: ids },
          scheduledDate: { gte: start, lte: end },
        },
        select: { professionalId: true, patientId: true },
      }),
    ]);

  const sessionsByTherapist = new Map(
    sessionsGrouped.map((s) => [
      s.therapistId,
      { count: s._count, hours: (s._sum.sessionDuration ?? 0) / 60 },
    ])
  );
  const appointmentsByProfessional = new Map(
    appointmentsGrouped.map((a) => [a.professionalId, a._count])
  );
  const patientsByTherapist = new Map<string, Set<string>>();
  for (const s of patientIdsFromSessions) {
    const pid = s.psychologyRecord?.medicalRecord?.patientId;
    if (pid) {
      if (!patientsByTherapist.has(s.therapistId)) patientsByTherapist.set(s.therapistId, new Set());
      patientsByTherapist.get(s.therapistId)!.add(pid);
    }
  }
  const patientsByProfessional = new Map<string, Set<string>>();
  for (const a of patientIdsFromAppointments) {
    if (!patientsByProfessional.has(a.professionalId))
      patientsByProfessional.set(a.professionalId, new Set());
    patientsByProfessional.get(a.professionalId)!.add(a.patientId);
  }

  return psychologists.map((p) => {
    const sessionsData = sessionsByTherapist.get(p.id) ?? { count: 0, hours: 0 };
    const setA = patientsByTherapist.get(p.id);
    const setB = patientsByProfessional.get(p.id);
    const patientsCount = new Set([...(setA ?? []), ...(setB ?? [])]).size;
    return {
      psychologistId: p.id,
      psychologistName: `${p.firstName} ${p.lastName}`.trim(),
      patientsCount,
      sessionsCount: sessionsData.count,
      appointmentsCompleted: appointmentsByProfessional.get(p.id) ?? 0,
      hoursApprox: Math.round(sessionsData.hours * 10) / 10,
    };
  });
}
