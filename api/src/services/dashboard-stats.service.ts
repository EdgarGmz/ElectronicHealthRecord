import { Prisma } from '@prisma/client';
import prisma from '../config/database';

export type PeriodType = 'day' | 'month' | 'year';

export interface NursingKpis {
  patientsAttended: number;
  suppliesConsumed: number;
}

function getTodayRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { start, end };
}

function getLastNDaysRange(days: number): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

function getYearToDateRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { start, end };
}

export async function getNursingKpisForRange(startDate: Date, endDate: Date): Promise<NursingKpis> {
  const [patientsAttended, suppliesConsumed] = await Promise.all([
    prisma.nursingConsultation.findMany({
      where: { consultationDate: { gte: startDate, lte: endDate } },
      select: { medicalRecordId: true },
    }).then((rows) => new Set(rows.map((r) => r.medicalRecordId)).size),
    prisma.medicationAdministration.count({
      where: { administrationDate: { gte: startDate, lte: endDate } },
    }),
  ]);
  return { patientsAttended, suppliesConsumed };
}

export async function getNursingKpis(): Promise<{ day: NursingKpis; week: NursingKpis; year: NursingKpis }> {
  const { start: dayStart, end: dayEnd } = getTodayRange();
  const { start: weekStart, end: weekEnd } = getLastNDaysRange(7);
  const { start: yearStart, end: yearEnd } = getYearToDateRange();

  const [day, week, year] = await Promise.all([
    getNursingKpisForRange(dayStart, dayEnd),
    getNursingKpisForRange(weekStart, weekEnd),
    getNursingKpisForRange(yearStart, yearEnd),
  ]);
  return { day, week, year };
}

export interface DashboardChartParams {
  periodType: PeriodType;
  startDate: Date;
  endDate: Date;
}

/** Unique patients with at least one therapy session in the period, grouped by period bucket */
async function getPsychologyPatientsByPeriod(
  startDate: Date,
  endDate: Date,
  periodType: PeriodType
): Promise<{ period: string; count: number }[]> {
  const trunc = periodType === 'day' ? 'day' : periodType === 'month' ? 'month' : 'year';
  const format = periodType === 'day' ? 'YYYY-MM-DD' : periodType === 'month' ? 'YYYY-MM' : 'YYYY';
  // date_trunc expects a text literal like 'month'. We only allow day/month/year, so this is safe.
  const truncRaw = Prisma.raw(`'${trunc}'`);

  const result = await prisma.$queryRaw<{ period: Date; count: bigint }[]>`
    SELECT date_trunc(${truncRaw}, t.session_date::date)::date AS period,
           count(DISTINCT mr.patient_id)::bigint AS count
    FROM therapy_sessions t
    INNER JOIN psychology_records pr ON pr.id = t.psychology_record_id
    INNER JOIN medical_records mr ON mr.id = pr.medical_record_id
    WHERE t.session_date >= ${startDate} AND t.session_date <= ${endDate}
    GROUP BY date_trunc(${truncRaw}, t.session_date::date)::date
    ORDER BY period
  `;

  return result.map((row) => ({
    period: formatPeriod(row.period, format),
    count: Number(row.count),
  }));
}

/** Unique patients with at least one nursing consultation in the period, grouped by period bucket */
async function getNursingPatientsByPeriod(
  startDate: Date,
  endDate: Date,
  periodType: PeriodType
): Promise<{ period: string; count: number }[]> {
  const trunc = periodType === 'day' ? 'day' : periodType === 'month' ? 'month' : 'year';
  const format = periodType === 'day' ? 'YYYY-MM-DD' : periodType === 'month' ? 'YYYY-MM' : 'YYYY';
  // date_trunc expects a text literal like 'month'. We only allow day/month/year, so this is safe.
  const truncRaw = Prisma.raw(`'${trunc}'`);

  const result = await prisma.$queryRaw<{ period: Date; count: bigint }[]>`
    SELECT date_trunc(${truncRaw}, nc.consultation_date::date)::date AS period,
           count(DISTINCT nc.medical_record_id)::bigint AS count
    FROM nursing_consultations nc
    INNER JOIN medical_records mr ON mr.id = nc.medical_record_id
    WHERE nc.consultation_date >= ${startDate} AND nc.consultation_date <= ${endDate}
    GROUP BY date_trunc(${truncRaw}, nc.consultation_date::date)::date
    ORDER BY period
  `;

  return result.map((row) => ({
    period: formatPeriod(row.period, format),
    count: Number(row.count),
  }));
}

function formatPeriod(d: Date, format: string): string {
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  if (format === 'YYYY-MM-DD') return `${y}-${m}-${day}`;
  if (format === 'YYYY-MM') return `${y}-${m}`;
  return String(y);
}

/** Merge psychology and nursing series into one array by period (for bar/line/area) */
function mergeByPeriod(
  psych: { period: string; count: number }[],
  nursing: { period: string; count: number }[]
): { period: string; psychology: number; nursing: number }[] {
  const map = new Map<string, { psychology: number; nursing: number }>();
  for (const p of psych) map.set(p.period, { psychology: p.count, nursing: 0 });
  for (const n of nursing) {
    const existing = map.get(n.period) ?? { psychology: 0, nursing: 0 };
    map.set(n.period, { ...existing, nursing: n.count });
  }
  return Array.from(map.entries())
    .map(([period, v]) => ({ period, ...v }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

/** Totals by service for pie/donut/treemap (unique patients in period) */
async function getServiceTotals(startDate: Date, endDate: Date): Promise<{ service: string; count: number }[]> {
  const [psychology, nursing] = await Promise.all([
    prisma.therapySession.findMany({
      where: { sessionDate: { gte: startDate, lte: endDate } },
      select: { psychologyRecord: { select: { medicalRecord: { select: { patientId: true } } } } },
    }),
    prisma.nursingConsultation.findMany({
      where: { consultationDate: { gte: startDate, lte: endDate } },
      select: { medicalRecordId: true },
    }),
  ]);
  const psychPatients = new Set(psychology.map((t) => t.psychologyRecord.medicalRecord.patientId));
  const nursingPatients = await (async () => {
    const mrIds = [...new Set(nursing.map((n) => n.medicalRecordId))];
    const records = await prisma.medicalRecord.findMany({
      where: { id: { in: mrIds } },
      select: { patientId: true },
    });
    return new Set(records.map((r) => r.patientId));
  })();
  return [
    { service: 'psychology', count: psychPatients.size },
    { service: 'nursing', count: nursingPatients.size },
  ];
}

/** Scatter: psychology count vs nursing count per period (same as bar data, different chart) */
/** Histogram: distribution of sessions/consultations per patient (buckets) */
async function getHistogramData(
  startDate: Date,
  endDate: Date,
  service: 'psychology' | 'nursing'
): Promise<{ bucket: string; count: number }[]> {
  if (service === 'psychology') {
    const perPatient = await prisma.therapySession.groupBy({
      by: ['psychologyRecordId'],
      where: { sessionDate: { gte: startDate, lte: endDate } },
      _count: true,
    });
    const counts = perPatient.map((p) => p._count);
    return bucketize(counts, [1, 2, 3, 5, 10, 20, 50]);
  } else {
    const perRecord = await prisma.nursingConsultation.groupBy({
      by: ['medicalRecordId'],
      where: { consultationDate: { gte: startDate, lte: endDate } },
      _count: true,
    });
    const counts = perRecord.map((p) => p._count);
    return bucketize(counts, [1, 2, 3, 5, 10, 20, 50]);
  }
}

function bucketize(values: number[], edges: number[]): { bucket: string; count: number }[] {
  const labels = [`1-${edges[0]}`, ...edges.slice(1).map((e, i) => `${edges[i] + 1}-${e}`), `${edges[edges.length - 1] + 1}+`];
  const buckets = labels.map((bucket) => ({ bucket, count: 0 }));
  for (const v of values) {
    let idx = edges.findIndex((e) => v <= e);
    if (idx === -1) idx = edges.length;
    buckets[idx].count += 1;
  }
  return buckets;
}

/** Radar: dimensions for psychology vs nursing (total sessions, unique patients, etc.) */
async function getRadarData(startDate: Date, endDate: Date): Promise<
  { subject: string; psychology: number; nursing: number; fullMark: number }[]
> {
  const [psychSessions, psychPatients, nursingConsultations, nursingPatients] = await Promise.all([
    prisma.therapySession.count({ where: { sessionDate: { gte: startDate, lte: endDate } } }),
    prisma.therapySession.findMany({
      where: { sessionDate: { gte: startDate, lte: endDate } },
      select: { psychologyRecord: { select: { medicalRecord: { select: { patientId: true } } } } },
    }),
    prisma.nursingConsultation.count({ where: { consultationDate: { gte: startDate, lte: endDate } } }),
    prisma.nursingConsultation.findMany({
      where: { consultationDate: { gte: startDate, lte: endDate } },
      select: { medicalRecordId: true },
    }),
  ]);
  const psychPatientSet = new Set(
    psychPatients.map((t) => t.psychologyRecord.medicalRecord.patientId)
  );
  const nursingMrIds = [...new Set(nursingPatients.map((n) => n.medicalRecordId))];
  const nursingPatientCount =
    nursingMrIds.length === 0
      ? 0
      : await prisma.medicalRecord.count({ where: { id: { in: nursingMrIds } } });

  const maxVal = Math.max(psychSessions, psychPatientSet.size, nursingConsultations, nursingPatientCount, 1);
  return [
    { subject: 'Sesiones/Consultas', psychology: psychSessions, nursing: nursingConsultations, fullMark: maxVal },
    { subject: 'Pacientes únicos', psychology: psychPatientSet.size, nursing: nursingPatientCount, fullMark: maxVal },
  ];
}

/** Heatmap: day of week (0-6) x service (psychology/nursing) -> count of events */
async function getHeatmapData(startDate: Date, endDate: Date): Promise<
  { dayOfWeek: number; dayName: string; psychology: number; nursing: number }[]
> {
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const [psychRows, nursingRows] = await Promise.all([
    prisma.$queryRaw<{ dow: number; cnt: bigint }[]>`
      SELECT EXTRACT(DOW FROM session_date)::int AS dow, count(*)::bigint AS cnt
      FROM therapy_sessions
      WHERE session_date >= ${startDate} AND session_date <= ${endDate}
      GROUP BY EXTRACT(DOW FROM session_date)
    `,
    prisma.$queryRaw<{ dow: number; cnt: bigint }[]>`
      SELECT EXTRACT(DOW FROM consultation_date)::int AS dow, count(*)::bigint AS cnt
      FROM nursing_consultations
      WHERE consultation_date >= ${startDate} AND consultation_date <= ${endDate}
      GROUP BY EXTRACT(DOW FROM consultation_date)
    `,
  ]);
  const psychMap = new Map(psychRows.map((r) => [r.dow, Number(r.cnt)]));
  const nursingMap = new Map(nursingRows.map((r) => [r.dow, Number(r.cnt)]));
  return [0, 1, 2, 3, 4, 5, 6].map((dow) => ({
    dayOfWeek: dow,
    dayName: dayNames[dow],
    psychology: psychMap.get(dow) ?? 0,
    nursing: nursingMap.get(dow) ?? 0,
  }));
}

/** Gantt-like: list of "events" with start date for timeline (simplified: sessions/consultations by date) */
async function getTimelineData(
  startDate: Date,
  endDate: Date
): Promise<{ name: string; start: string; end: string; type: 'psychology' | 'nursing' }[]> {
  const [sessions, consultations] = await Promise.all([
    prisma.therapySession.findMany({
      where: { sessionDate: { gte: startDate, lte: endDate } },
      select: { sessionDate: true, sessionDuration: true, id: true },
      orderBy: { sessionDate: 'asc' },
      take: 100,
    }),
    prisma.nursingConsultation.findMany({
      where: { consultationDate: { gte: startDate, lte: endDate } },
      select: { consultationDate: true, id: true },
      orderBy: { consultationDate: 'asc' },
      take: 100,
    }),
  ]);
  const items: { name: string; start: string; end: string; type: 'psychology' | 'nursing' }[] = [];
  for (const s of sessions) {
    const start = new Date(s.sessionDate);
    const end = new Date(start.getTime() + (s.sessionDuration || 50) * 60 * 1000);
    items.push({
      name: `Sesión ${s.id.slice(0, 8)}`,
      start: start.toISOString(),
      end: end.toISOString(),
      type: 'psychology',
    });
  }
  for (const c of consultations) {
    const start = new Date(c.consultationDate);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    items.push({
      name: `Consulta ${c.id.slice(0, 8)}`,
      start: start.toISOString(),
      end: end.toISOString(),
      type: 'nursing',
    });
  }
  items.sort((a, b) => a.start.localeCompare(b.start));
  return items.slice(0, 80);
}

export interface DashboardChartData {
  byPeriod: { period: string; psychology: number; nursing: number }[];
  byService: { service: string; count: number }[];
  scatter: { period: string; psychology: number; nursing: number }[];
  histogramPsychology: { bucket: string; count: number }[];
  histogramNursing: { bucket: string; count: number }[];
  radar: { subject: string; psychology: number; nursing: number; fullMark: number }[];
  heatmap: { dayOfWeek: number; dayName: string; psychology: number; nursing: number }[];
  timeline: { name: string; start: string; end: string; type: 'psychology' | 'nursing' }[];
}

export async function getDashboardChartData(params: DashboardChartParams): Promise<DashboardChartData> {
  const { periodType, startDate, endDate } = params;

  const [psychByPeriod, nursingByPeriod, byService, histPsych, histNursing, radar, heatmap, timeline] =
    await Promise.all([
      getPsychologyPatientsByPeriod(startDate, endDate, periodType),
      getNursingPatientsByPeriod(startDate, endDate, periodType),
      getServiceTotals(startDate, endDate),
      getHistogramData(startDate, endDate, 'psychology'),
      getHistogramData(startDate, endDate, 'nursing'),
      getRadarData(startDate, endDate),
      getHeatmapData(startDate, endDate),
      getTimelineData(startDate, endDate),
    ]);

  const byPeriod = mergeByPeriod(psychByPeriod, nursingByPeriod);

  return {
    byPeriod,
    byService,
    scatter: byPeriod,
    histogramPsychology: histPsych,
    histogramNursing: histNursing,
    radar,
    heatmap,
    timeline,
  };
}

export async function getNursingPatientsSeriesFiltered(params: {
  periodType: PeriodType;
  startDate: Date;
  endDate: Date;
  careerId?: string;
  includeGeneral?: boolean;
  sex?: 'male' | 'female';
}): Promise<{ period: string; count: number }[]> {
  const { periodType, startDate, endDate, careerId, includeGeneral, sex } = params;
  const trunc = periodType === 'day' ? 'day' : periodType === 'month' ? 'month' : 'year';
  const format = periodType === 'day' ? 'YYYY-MM-DD' : periodType === 'month' ? 'YYYY-MM' : 'YYYY';
  const truncRaw = Prisma.raw(`'${trunc}'`);

  const whereParts: Prisma.Sql[] = [
    Prisma.sql`nc.consultation_date >= ${startDate} AND nc.consultation_date <= ${endDate}`,
  ];

  if (sex) {
    whereParts.push(Prisma.sql`u.sex = ${sex}`);
  }

  if (careerId?.trim()) {
    whereParts.push(Prisma.sql`p.patient_type = 'student' AND p.career_id = ${careerId.trim()}::uuid`);
  } else if (includeGeneral) {
    whereParts.push(Prisma.sql`p.patient_type IN ('faculty', 'administrative')`);
  }

  const whereSql =
    whereParts.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(whereParts, ' AND ')}`
      : Prisma.empty;

  const result = await prisma.$queryRaw<{ period: Date; count: bigint }[]>`
    SELECT date_trunc(${truncRaw}, nc.consultation_date::date)::date AS period,
           count(DISTINCT p.id)::bigint AS count
    FROM nursing_consultations nc
    INNER JOIN medical_records mr ON mr.id = nc.medical_record_id
    INNER JOIN patients p ON p.id = mr.patient_id
    INNER JOIN users u ON u.id = p.user_id
    ${whereSql}
    GROUP BY date_trunc(${truncRaw}, nc.consultation_date::date)::date
    ORDER BY period
  `;

  return result.map((row) => ({
    period: formatPeriod(row.period, format),
    count: Number(row.count),
  }));
}
