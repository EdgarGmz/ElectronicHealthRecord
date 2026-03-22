import prisma from '../config/database';
import { ROLES } from '../constants/roles';
import { APPOINTMENT_STATUS } from '../constants/appointment';

const RISK_LEVELS_ALERT = ['high', 'medium'];
const DEPARTMENT_PSYCHOLOGY = 'psychology';
const RECOMMENDED_WEEKLY_HOURS = 25;
const CHURN_LOOKBACK_MONTHS = 6;
const SCALE_TYPES = ['PHQ-9', 'GAD-7', 'PHQ9', 'GAD7'];

const GROUNDING_PHRASES = [
  'Respira. Este momento es solo un momento.',
  'No tienes que hacer todo hoy. Solo el siguiente paso.',
  'Cuidar de ti no es egoísmo; es requisito.',
  'Entre paciente y paciente: tres respiraciones profundas.',
  'Tu bienestar permite el de otros. Pausa cuando lo necesites.',
  'Un paso a la vez. La carga se lleva mejor así.',
  'Estar presente es el mejor regalo que puedes dar.',
  'Permítete una pausa. El sistema puede esperar 60 segundos.',
];

export interface RiskAlertItem {
  patientId: string;
  patientName: string;
  suicideRiskLevel: string;
  lastSessionDate: string | null;
  psychologyRecordId: string;
}

export interface AgendaItem {
  id: string;
  scheduledDate: string;
  patientName: string;
  professionalName: string;
  appointmentType: string;
  status: string;
  durationMinutes: number;
  tag?: 'first' | 'follow_up' | 'discharge_soon';
}

export interface ClinicalMetrics {
  churnRatePercent: number;
  churnDenominator: number;
  churnNumerator: number;
  averageProgressScales: { scale: string; averageChange: number; sampleSize: number }[];
  topDiagnoses: { diagnosis: string; count: number; percent: number }[];
  moodDistribution: { mood: string; count: number; percent: number }[];
}

export interface WorkloadItem {
  professionalId: string;
  professionalName: string;
  hoursThisWeek: number;
  overRecommended: boolean;
}

export interface CoordinatorPsychologyDashboardData {
  riskAlerts: RiskAlertItem[];
  crisisFollowUp: RiskAlertItem[];
  agendaToday: AgendaItem[];
  appointmentsToConfirm: AgendaItem[];
  clinicalMetrics: ClinicalMetrics;
  workload: WorkloadItem[];
  groundingPhrase: string;
}

function getWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

function getTodayRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { start, end };
}

function tagForAppointment(appointmentType: string, sessionCount?: number): AgendaItem['tag'] {
  const type = (appointmentType || '').toLowerCase();
  if (type.includes('primera') || type.includes('first') || type.includes('inicial') || sessionCount === 1) return 'first';
  if (type.includes('alta') || type.includes('cierre') || type.includes('discharge')) return 'discharge_soon';
  return 'follow_up';
}

export async function getCoordinatorPsychologyDashboardData(
  userId: string,
  userRole: string
): Promise<CoordinatorPsychologyDashboardData> {
  void userId; // evita TS6133 por parámetro no usado
  if (userRole !== ROLES.COORDINADOR_PSICOLOGIA) {
    return {
      riskAlerts: [],
      crisisFollowUp: [],
      agendaToday: [],
      appointmentsToConfirm: [],
      clinicalMetrics: {
        churnRatePercent: 0,
        churnDenominator: 0,
        churnNumerator: 0,
        averageProgressScales: [],
        topDiagnoses: [],
        moodDistribution: [],
      },
      workload: [],
      groundingPhrase: GROUNDING_PHRASES[0],
    };
  }

  const todayRange = getTodayRange();
  const weekRange = getWeekRange();
  const churnStart = new Date();
  churnStart.setMonth(churnStart.getMonth() - CHURN_LOOKBACK_MONTHS);
  churnStart.setHours(0, 0, 0, 0);

  const riskRecords = await prisma.psychologyRecord.findMany({
    where: { suicideRiskLevel: { in: RISK_LEVELS_ALERT } },
    include: {
      medicalRecord: {
        include: {
          patient: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
      },
    },
  });

  const [appointmentsToday, sessionCountsPerRecord, churnData, scaleProgress, diagnoses, therapistHours, lastSessions, sessionMoods] =
    await Promise.all([
      prisma.appointment.findMany({
        where: {
          department: DEPARTMENT_PSYCHOLOGY,
          scheduledDate: { gte: todayRange.start, lte: todayRange.end },
          status: { in: [APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.CONFIRMED] },
        },
        include: {
          patient: { include: { user: { select: { firstName: true, lastName: true } } } },
          professional: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { scheduledDate: 'asc' },
      }),
      prisma.therapySession.groupBy({
        by: ['psychologyRecordId'],
        where: { sessionDate: { gte: churnStart } },
        _count: true,
      }),
      prisma.therapySession.findMany({
        where: { sessionDate: { gte: churnStart } },
        select: {
          psychologyRecordId: true,
          psychologyRecord: { select: { medicalRecord: { select: { patientId: true } } } },
        },
      }),
      prisma.psychometricEvaluation.findMany({
        where: {
          evaluationType: {
            in: SCALE_TYPES,
          },
        },
        select: {
          psychologyRecordId: true,
          evaluationType: true,
          rawScore: true,
          applicationDate: true,
        },
        orderBy: { applicationDate: 'asc' },
      }),
      prisma.psychologyRecord.findMany({
        where: { currentDiagnosisDsm5: { not: null } },
        select: { currentDiagnosisDsm5: true },
      }),
      prisma.therapySession.groupBy({
        by: ['therapistId'],
        where: { sessionDate: { gte: weekRange.start, lte: weekRange.end } },
        _sum: { sessionDuration: true },
      }),
      prisma.therapySession.findMany({
        where: {
          psychologyRecordId: { in: riskRecords.map((r) => r.id) },
        },
        select: { psychologyRecordId: true, sessionDate: true },
        orderBy: { sessionDate: 'desc' },
      }),
      prisma.therapySession.findMany({
        select: { mood: true },
      }),
    ]);

  const sessionCountByRecord = new Map(sessionCountsPerRecord.map((s) => [s.psychologyRecordId, s._count]));
  const lastSessionByRecord = new Map<string, Date>();
  for (const s of lastSessions) {
    if (!lastSessionByRecord.has(s.psychologyRecordId) || lastSessionByRecord.get(s.psychologyRecordId)! < s.sessionDate) {
      lastSessionByRecord.set(s.psychologyRecordId, s.sessionDate);
    }
  }

  const riskAlerts: RiskAlertItem[] = riskRecords.map((r) => {
    const patient = r.medicalRecord.patient;
    const last = lastSessionByRecord.get(r.id);
    return {
      patientId: patient.id,
      patientName: `${patient.user.firstName} ${patient.user.lastName}`.trim(),
      suicideRiskLevel: r.suicideRiskLevel,
      lastSessionDate: last ? last.toISOString().slice(0, 10) : null,
      psychologyRecordId: r.id,
    };
  });

  const agendaToday: AgendaItem[] = appointmentsToday.map((a) => {
    const recordId = riskRecords.find((r) => r.medicalRecord.patientId === a.patientId)?.id;
    const sessionCount = recordId ? sessionCountByRecord.get(recordId) : undefined;
    return {
      id: a.id,
      scheduledDate: a.scheduledDate.toISOString(),
      patientName: `${a.patient.user.firstName} ${a.patient.user.lastName}`.trim(),
      professionalName: `${a.professional.firstName} ${a.professional.lastName}`.trim(),
      appointmentType: a.appointmentType,
      status: a.status,
      durationMinutes: a.durationMinutes,
      tag: tagForAppointment(a.appointmentType, sessionCount),
    };
  });

  const appointmentsToConfirm = agendaToday.filter((a) => a.status === APPOINTMENT_STATUS.SCHEDULED);

  const sessionsPerPatient = new Map<string, number>();
  for (const s of churnData) {
    const patientId = s.psychologyRecord.medicalRecord.patientId;
    sessionsPerPatient.set(patientId, (sessionsPerPatient.get(patientId) ?? 0) + 1);
  }
  const patientsWithSessions = sessionsPerPatient.size;
  const patientsWithExactlyOneSession = [...sessionsPerPatient.entries()].filter(([, n]) => n === 1).length;
  const churnNumerator = patientsWithExactlyOneSession;
  const churnDenominator = patientsWithSessions;
  const churnRatePercent = churnDenominator > 0 ? Math.round((churnNumerator / churnDenominator) * 100) : 0;

  const scaleByRecord = new Map<string, { type: string; first: number; last: number }[]>();
  for (const e of scaleProgress) {
    const key = e.psychologyRecordId;
    const score = e.rawScore != null ? Number(e.rawScore) : NaN;
    if (Number.isNaN(score)) continue;
    const type = e.evaluationType;
    if (!scaleByRecord.has(key)) scaleByRecord.set(key, []);
    const arr = scaleByRecord.get(key)!;
    const existing = arr.find((x) => x.type === type);
    if (!existing) {
      arr.push({ type, first: score, last: score });
    } else {
      existing.last = score;
    }
  }
  const scaleAgg: Record<string, { sum: number; n: number }> = {};
  for (const arr of scaleByRecord.values()) {
    for (const { type, first, last } of arr) {
      if (!scaleAgg[type]) scaleAgg[type] = { sum: 0, n: 0 };
      scaleAgg[type].sum += last - first;
      scaleAgg[type].n += 1;
    }
  }
  const averageProgressScales = Object.entries(scaleAgg).map(([scale, { sum, n }]) => ({
    scale: scale,
    averageChange: n > 0 ? Math.round((sum / n) * 10) / 10 : 0,
    sampleSize: n,
  }));

  const diagnosisCount: Record<string, number> = {};
  for (const r of diagnoses) {
    const d = (r.currentDiagnosisDsm5 || '').trim();
    if (!d) continue;
    diagnosisCount[d] = (diagnosisCount[d] || 0) + 1;
  }
  const totalD = Object.values(diagnosisCount).reduce((a, b) => a + b, 0);
  const topDiagnoses = Object.entries(diagnosisCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([diagnosis, count]) => ({
      diagnosis,
      count,
      percent: totalD > 0 ? Math.round((count / totalD) * 100) : 0,
    }));

  const moodCount: Record<string, number> = {};
  for (const s of sessionMoods) {
    const raw = (s.mood || '').trim();
    if (!raw) continue;
    const codes = raw.split(',').map((c) => c.trim()).filter(Boolean);
    for (const code of codes) {
      moodCount[code] = (moodCount[code] || 0) + 1;
    }
  }
  const totalMoods = Object.values(moodCount).reduce((a, b) => a + b, 0);
  const sortedMoods = Object.entries(moodCount).sort((a, b) => b[1] - a[1]);
  const topMoodEntries = sortedMoods.slice(0, 10);
  const topMoodDistribution = topMoodEntries.map(([mood, count]) => ({
    mood,
    count,
    percent: totalMoods > 0 ? Math.round((count / totalMoods) * 100) : 0,
  }));
  const othersEntries = sortedMoods.slice(10);
  const othersCount = othersEntries.reduce((sum, [, count]) => sum + count, 0);
  if (othersCount > 0) {
    topMoodDistribution.push({
      mood: 'others',
      count: othersCount,
      percent: totalMoods > 0 ? Math.round((othersCount / totalMoods) * 100) : 0,
    });
  }

  const therapistIds = [...new Set(therapistHours.map((t) => t.therapistId))];
  const therapists = await prisma.user.findMany({
    where: { id: { in: therapistIds }, role: ROLES.PSICOLOGO },
    select: { id: true, firstName: true, lastName: true },
  });
  const therapistMap = new Map(therapists.map((t) => [t.id, t]));
  const workload: WorkloadItem[] = therapistHours.map((t) => {
    const hours = ((t._sum.sessionDuration || 0) / 60);
    const u = therapistMap.get(t.therapistId);
    return {
      professionalId: t.therapistId,
      professionalName: u ? `${u.firstName} ${u.lastName}`.trim() : '—',
      hoursThisWeek: Math.round(hours * 10) / 10,
      overRecommended: hours > RECOMMENDED_WEEKLY_HOURS,
    };
  });

  const groundingPhrase = GROUNDING_PHRASES[Math.floor(Math.random() * GROUNDING_PHRASES.length)];

  return {
    riskAlerts,
    crisisFollowUp: riskAlerts,
    agendaToday,
    appointmentsToConfirm,
    clinicalMetrics: {
      churnRatePercent,
      churnDenominator,
      churnNumerator,
      averageProgressScales,
      topDiagnoses,
      moodDistribution: topMoodDistribution,
    },
    workload,
    groundingPhrase,
  };
}
