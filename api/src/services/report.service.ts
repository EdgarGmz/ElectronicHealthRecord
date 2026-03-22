import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

// Constants
const MAX_CONSULTATION_RECORDS = 100; // Maximum number of consultation records to return in a report
const MAX_REPORT_LIST_RECORDS = 100; // Maximum list rows for report detail

const PATIENT_TYPES_GENERAL = ['faculty', 'administrative'] as const;

interface ReportFilters {
  department?: string;
  periodStart: Date;
  periodEnd: Date;
  /** Para psicólogo: solo datos de estudiantes de estas carreras o personal docente/administrativo */
  careerIds?: string[];
}

export class ReportService {
  /**
   * Generate statistics report
   * Returns aggregate statistics for appointments, patients, and therapy sessions
   */
  async generateStatisticsReport(filters: ReportFilters, generatedBy: string) {
    const { department, periodStart, periodEnd, careerIds } = filters;

    const patientScopeWhere: Prisma.PatientWhereInput | undefined =
      careerIds && careerIds.length
        ? {
            OR: [
              { patientType: { in: [...PATIENT_TYPES_GENERAL] } },
              { patientType: 'student', careerId: { in: careerIds } },
            ],
          }
        : undefined;

    // Build where clause for appointments
    const appointmentWhere: Prisma.AppointmentWhereInput = {
      scheduledDate: {
        gte: periodStart,
        lte: periodEnd,
      },
    };

    if (department) {
      appointmentWhere.department = department;
    }
    if (patientScopeWhere) {
      appointmentWhere.patient = patientScopeWhere;
    }

    // Get appointment statistics
    const [totalAppointments, completedAppointments, cancelledAppointments, appointmentsByType] = await Promise.all([
      prisma.appointment.count({ where: appointmentWhere }),
      prisma.appointment.count({ where: { ...appointmentWhere, status: 'completed' } }),
      prisma.appointment.count({ where: { ...appointmentWhere, status: 'cancelled' } }),
      prisma.appointment.groupBy({
        by: ['appointmentType'],
        where: appointmentWhere,
        _count: true,
      }),
    ]);

    // Get therapy session statistics (for psychology department)
    let therapySessionStats = null;
    if (!department || department === 'psychology') {
      const therapyWhere: Prisma.TherapySessionWhereInput = {
        sessionDate: { gte: periodStart, lte: periodEnd },
      };
      if (patientScopeWhere) {
        therapyWhere.psychologyRecord = { medicalRecord: { patient: patientScopeWhere } };
      }
      therapySessionStats = await prisma.therapySession.count({ where: therapyWhere });
    }

    // Get patient statistics
    const patientWhereBase: Prisma.PatientWhereInput = {
      createdAt: { lte: periodEnd },
    };
    if (patientScopeWhere) {
      patientWhereBase.AND = [patientScopeWhere];
    }
    const totalPatients = await prisma.patient.count({ where: patientWhereBase });

    const newPatientWhere: Prisma.PatientWhereInput = {
      createdAt: { gte: periodStart, lte: periodEnd },
    };
    if (patientScopeWhere) {
      newPatientWhere.AND = [patientScopeWhere];
    }
    const newPatients = await prisma.patient.count({ where: newPatientWhere });

    // Get nursing consultation statistics (for nursing department)
    let nursingStats = null;
    if (!department || department === 'nursing') {
      const nursingConsultationWhere: Prisma.NursingConsultationWhereInput = {
        consultationDate: {
          gte: periodStart,
          lte: periodEnd,
        },
      };
      const medicationAdministrationWhere: Prisma.MedicationAdministrationWhereInput = {
        administrationDate: {
          gte: periodStart,
          lte: periodEnd,
        },
      };
      const nursingProcedureWhere: Prisma.NursingProcedureWhereInput = {
        procedureDate: {
          gte: periodStart,
          lte: periodEnd,
        },
      };

      const [
        totalConsultations,
        medicationsAdministered,
        proceduresPerformed,
        medicationsByMedication,
        medicationAdministrations,
      ] = await Promise.all([
        prisma.nursingConsultation.count({ where: nursingConsultationWhere }),
        prisma.medicationAdministration.count({ where: medicationAdministrationWhere }),
        prisma.nursingProcedure.count({ where: nursingProcedureWhere }),
        prisma.medicationAdministration.groupBy({
          by: ['medicationId'],
          where: medicationAdministrationWhere,
          _count: { _all: true },
        }),
        prisma.medicationAdministration.findMany({
          where: medicationAdministrationWhere,
          include: {
            medication: { select: { name: true, genericName: true } },
            consultation: {
              include: {
                medicalRecord: {
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
            },
          },
          orderBy: { administrationDate: 'desc' },
          take: MAX_REPORT_LIST_RECORDS,
        }),
      ]);

      nursingStats = {
        totalConsultations,
        medicationsAdministered,
        proceduresPerformed,
        medicationsByMedication: [] as Array<{ medication: string; count: number }>,
        medicationAdministrations: medicationAdministrations.map((ma) => {
          const patientUser = ma.consultation?.medicalRecord?.patient?.user;
          const patientName = patientUser
            ? `${patientUser.firstName} ${patientUser.lastName}`.trim()
            : '—';
          const enrollmentNumber = patientUser?.enrollmentNumber ?? null;
          const medicationName =
            ma.medication?.name ?? ma.medication?.genericName ?? '—';

          return {
            id: ma.id,
            patient: patientName,
            enrollmentNumber,
            medication: medicationName,
            dosage: ma.dosage,
            route: ma.route,
            administrationDate: ma.administrationDate.toISOString(),
            medicationVerified: ma.medicationVerified,
            patientVerified: ma.patientVerified,
            dosageVerified: ma.dosageVerified,
            routeVerified: ma.routeVerified,
            timeVerified: ma.timeVerified,
          };
        }),
      };

      // medicationsByMedication: resolve medication names for nicer UX
      const medicationIds = medicationsByMedication.map((r) => r.medicationId).filter(Boolean);
      const meds = await prisma.medication.findMany({
        where: { id: { in: medicationIds as string[] } },
        select: { id: true, name: true, genericName: true },
      });
      const medsById = new Map(meds.map((m) => [m.id, m]));
      nursingStats.medicationsByMedication = medicationsByMedication.map((row) => {
        const med = medsById.get(row.medicationId);
        const medicationName = med?.name ?? med?.genericName ?? row.medicationId;
        return {
          medication: medicationName,
          count: ((row as any)._count?._all ?? (row as any)._count) as number,
        };
      }).sort((a, b) => b.count - a.count).slice(0, MAX_REPORT_LIST_RECORDS);
    }

    // Lists detail (only for department nursing/psychology to keep payload bounded)
    let patientsList = undefined;
    let appointmentsList = undefined;
    if (department === 'nursing') {
      const nursingConsultationsForList = await prisma.nursingConsultation.findMany({
        where: {
          consultationDate: {
            gte: periodStart,
            lte: periodEnd,
          },
        },
        include: {
          medicalRecord: {
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
        orderBy: { consultationDate: 'desc' },
        take: MAX_REPORT_LIST_RECORDS,
      });

      const map = new Map<
        string,
        { patient: string; enrollmentNumber: string | null; count: number; first: Date; last: Date }
      >();

      for (const c of nursingConsultationsForList) {
        const user = c.medicalRecord?.patient?.user;
        const key = user ? `${user.firstName}_${user.lastName}_${user.enrollmentNumber ?? ''}` : c.medicalRecordId;
        const patient = user ? `${user.firstName} ${user.lastName}`.trim() : '—';
        const enrollmentNumber = user?.enrollmentNumber ?? null;
        const dt = c.consultationDate;

        const existing = map.get(key);
        if (!existing) {
          map.set(key, { patient, enrollmentNumber, count: 1, first: dt, last: dt });
        } else {
          existing.count += 1;
          if (dt < existing.first) existing.first = dt;
          if (dt > existing.last) existing.last = dt;
        }
      }

      patientsList = Array.from(map.values())
        .sort((a, b) => b.last.getTime() - a.last.getTime())
        .slice(0, MAX_REPORT_LIST_RECORDS)
        .map((p) => ({
          patient: p.patient,
          enrollmentNumber: p.enrollmentNumber,
          consultationsCount: p.count,
          firstConsultationAt: p.first.toISOString(),
          lastConsultationAt: p.last.toISOString(),
        }));
    }

    if (department === 'nursing' || department === 'psychology') {
      appointmentsList = await prisma.appointment.findMany({
        where: {
          ...appointmentWhere,
        },
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
          professional: { select: { firstName: true, lastName: true } },
        },
        orderBy: { scheduledDate: 'desc' },
        take: MAX_REPORT_LIST_RECORDS,
      }).then((rows) =>
        rows.map((a) => {
          const patientUser = a.patient?.user;
          const patientName = patientUser ? `${patientUser.firstName} ${patientUser.lastName}`.trim() : '—';
          return {
            id: a.id,
            patient: patientName,
            enrollmentNumber: patientUser?.enrollmentNumber ?? null,
            department: a.department,
            appointmentType: a.appointmentType,
            professional: a.professional
              ? `${a.professional.firstName} ${a.professional.lastName}`.trim()
              : '—',
            status: a.status,
            scheduledDate: a.scheduledDate.toISOString(),
            cancellationReason: a.cancellationReason ?? null,
          };
        }),
      );
    }

    const reportData = {
      period: {
        start: periodStart,
        end: periodEnd,
      },
      department: department || 'all',
      appointments: {
        total: totalAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        byType: appointmentsByType.map(item => ({
          type: item.appointmentType,
          count: item._count,
        })),
      },
      patients: {
        total: totalPatients,
        newPatients: newPatients,
      },
      ...(patientsList ? { patientsList } : {}),
      ...(appointmentsList ? { appointmentsList } : {}),
      ...(therapySessionStats !== null && { therapySessions: therapySessionStats }),
      ...(nursingStats && { nursingConsultations: nursingStats }),
    };

    // Save report metadata to database
    const report = await prisma.report.create({
      data: {
        reportType: 'statistics',
        department: department || 'all',
        periodStart,
        periodEnd,
        filters: filters as any,
        generatedBy,
        fileUrl: null, // Could be extended to generate PDF/CSV files
      },
    });

    return {
      report,
      data: reportData,
    };
  }

  /**
   * Generate consultations (interconsultations) report
   * Returns data about inter-departmental consultations
   */
  async generateConsultationsReport(filters: ReportFilters, generatedBy: string) {
    const { department, periodStart, periodEnd, careerIds } = filters;

    const patientScopeWhere: Prisma.PatientWhereInput | undefined =
      careerIds && careerIds.length
        ? {
            OR: [
              { patientType: { in: [...PATIENT_TYPES_GENERAL] } },
              { patientType: 'student', careerId: { in: careerIds } },
            ],
          }
        : undefined;

    const where: Prisma.InterconsultationWhereInput = {
      createdAt: {
        gte: periodStart,
        lte: periodEnd,
      },
    };

    if (department) {
      where.OR = [
        { fromDepartment: department },
        { toDepartment: department },
      ];
    }
    if (patientScopeWhere) {
      where.patient = patientScopeWhere;
    }

    // Get interconsultation statistics
    const [totalConsultations, consultationsByStatus, consultationsByUrgency, consultationsByDepartment] = await Promise.all([
      prisma.interconsultation.count({ where }),
      prisma.interconsultation.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      prisma.interconsultation.groupBy({
        by: ['urgency'],
        where,
        _count: true,
      }),
      prisma.interconsultation.groupBy({
        by: ['fromDepartment', 'toDepartment'],
        where,
        _count: true,
      }),
    ]);

    // Get detailed consultation list
    const consultations = await prisma.interconsultation.findMany({
      where,
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
        fromProfessional: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        toProfessional: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        respondedByUser: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: MAX_CONSULTATION_RECORDS, // Limit to avoid excessive data
    });

    const reportData = {
      period: {
        start: periodStart,
        end: periodEnd,
      },
      department: department || 'all',
      summary: {
        total: totalConsultations,
        byStatus: consultationsByStatus.map(item => ({
          status: item.status,
          count: item._count,
        })),
        byUrgency: consultationsByUrgency.map(item => ({
          urgency: item.urgency,
          count: item._count,
        })),
        byDepartments: consultationsByDepartment.map(item => ({
          from: item.fromDepartment,
          to: item.toDepartment,
          count: item._count,
        })),
      },
      consultations: consultations.map(c => ({
        id: c.id,
        patient: `${c.patient.user.firstName} ${c.patient.user.lastName}`,
        enrollmentNumber: c.patient.user.enrollmentNumber,
        fromDepartment: c.fromDepartment,
        toDepartment: c.toDepartment,
        fromProfessional: c.fromProfessional ? `${c.fromProfessional.firstName} ${c.fromProfessional.lastName}` : null,
        toProfessional: c.toProfessional ? `${c.toProfessional.firstName} ${c.toProfessional.lastName}` : null,
        reason: c.reason,
        urgency: c.urgency,
        status: c.status,
        createdAt: c.createdAt,
        respondedAt: c.respondedAt,
        respondedBy: c.respondedByUser ? `${c.respondedByUser.firstName} ${c.respondedByUser.lastName}` : null,
      })),
    };

    // Save report metadata to database
    const report = await prisma.report.create({
      data: {
        reportType: 'consultations',
        department: department || 'all',
        periodStart,
        periodEnd,
        filters: filters as any,
        generatedBy,
        fileUrl: null,
      },
    });

    return {
      report,
      data: reportData,
    };
  }

  /**
   * Generate diagnoses report
   * Returns data about diagnoses from psychology records
   */
  async generateDiagnosesReport(filters: ReportFilters, generatedBy: string) {
    const { department, periodStart, periodEnd, careerIds } = filters;

    // Diagnoses are primarily in psychology department
    if (department && department !== 'psychology') {
      throw new AppError('Diagnoses reports are only available for psychology department', 400);
    }

    const patientScopeWhere: Prisma.PatientWhereInput | undefined =
      careerIds && careerIds.length
        ? {
            OR: [
              { patientType: { in: [...PATIENT_TYPES_GENERAL] } },
              { patientType: 'student', careerId: { in: careerIds } },
            ],
          }
        : undefined;

    const psychologyWhere: Prisma.PsychologyRecordWhereInput = {
      createdAt: {
        gte: periodStart,
        lte: periodEnd,
      },
      OR: [
        { currentDiagnosisDsm5: { not: null } },
        { currentDiagnosisCie10: { not: null } },
      ],
    };
    if (patientScopeWhere) {
      psychologyWhere.medicalRecord = { patient: patientScopeWhere };
    }

    // Get psychology records with diagnoses in the period
    const psychologyRecords = await prisma.psychologyRecord.findMany({
      where: psychologyWhere,
      include: {
        medicalRecord: {
          include: {
            patient: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    enrollmentNumber: true,
                    dateOfBirth: true,
                  },
                },
              },
            },
          },
        },
        assignedPsychologist: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        therapySessions: {
          where: {
            sessionDate: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
          select: {
            id: true,
            sessionDate: true,
            sessionNumber: true,
          },
        },
      },
    });

    // Count diagnoses by DSM-5
    const dsm5Counts: Record<string, number> = {};
    const cie10Counts: Record<string, number> = {};

    psychologyRecords.forEach(record => {
      if (record.currentDiagnosisDsm5) {
        dsm5Counts[record.currentDiagnosisDsm5] = (dsm5Counts[record.currentDiagnosisDsm5] || 0) + 1;
      }
      if (record.currentDiagnosisCie10) {
        cie10Counts[record.currentDiagnosisCie10] = (cie10Counts[record.currentDiagnosisCie10] || 0) + 1;
      }
    });

    const reportData = {
      period: {
        start: periodStart,
        end: periodEnd,
      },
      department: 'psychology',
      summary: {
        totalRecords: psychologyRecords.length,
        totalDiagnosesDsm5: Object.keys(dsm5Counts).length,
        totalDiagnosesCie10: Object.keys(cie10Counts).length,
        mostCommonDsm5: Object.entries(dsm5Counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([diagnosis, count]) => ({ diagnosis, count })),
        mostCommonCie10: Object.entries(cie10Counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([diagnosis, count]) => ({ diagnosis, count })),
      },
      records: psychologyRecords.map(record => ({
        patient: `${record.medicalRecord.patient.user.firstName} ${record.medicalRecord.patient.user.lastName}`,
        enrollmentNumber: record.medicalRecord.patient.user.enrollmentNumber,
        dateOfBirth: record.medicalRecord.patient.user.dateOfBirth,
        diagnosisDsm5: record.currentDiagnosisDsm5,
        diagnosisCie10: record.currentDiagnosisCie10,
        chiefComplaint: record.chiefComplaint,
        assignedPsychologist: record.assignedPsychologist 
          ? `${record.assignedPsychologist.firstName} ${record.assignedPsychologist.lastName}` 
          : null,
        sessionCount: record.therapySessions.length,
        createdAt: record.createdAt,
      })),
    };

    // Save report metadata to database
    const report = await prisma.report.create({
      data: {
        reportType: 'diagnoses',
        department: 'psychology',
        periodStart,
        periodEnd,
        filters: filters as any,
        generatedBy,
        fileUrl: null,
      },
    });

    return {
      report,
      data: reportData,
    };
  }

  /**
   * Get a specific report by ID
   */
  async getReportById(id: string) {
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        generatedByUser: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    if (!report) {
      throw new AppError('Report not found', 404);
    }

    return report;
  }

  /**
   * Get all reports with filters
   */
  async getAllReports(
    page: number = 1,
    limit: number = 10,
    reportType?: string,
    department?: string
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.ReportWhereInput = {};

    if (reportType) {
      where.reportType = reportType;
    }

    if (department) {
      where.department = department;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        include: {
          generatedByUser: {
            select: {
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.report.count({ where }),
    ]);

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export default new ReportService();
