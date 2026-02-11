import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

// Constants
const MAX_CONSULTATION_RECORDS = 100; // Maximum number of consultation records to return in a report

interface ReportFilters {
  department?: string;
  periodStart: Date;
  periodEnd: Date;
}

export class ReportService {
  /**
   * Generate statistics report
   * Returns aggregate statistics for appointments, patients, and therapy sessions
   */
  async generateStatisticsReport(filters: ReportFilters, generatedBy: string) {
    const { department, periodStart, periodEnd } = filters;

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
      therapySessionStats = await prisma.therapySession.count({
        where: {
          sessionDate: {
            gte: periodStart,
            lte: periodEnd,
          },
        },
      });
    }

    // Get patient statistics
    const totalPatients = await prisma.patient.count({
      where: {
        createdAt: {
          lte: periodEnd,
        },
      },
    });

    const newPatients = await prisma.patient.count({
      where: {
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
    });

    // Get nursing consultation statistics (for nursing department)
    let nursingStats = null;
    if (!department || department === 'nursing') {
      nursingStats = {
        totalConsultations: await prisma.nursingConsultation.count({
          where: {
            consultationDate: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
        }),
        medicationsAdministered: await prisma.medicationAdministration.count({
          where: {
            administrationDate: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
        }),
        proceduresPerformed: await prisma.nursingProcedure.count({
          where: {
            procedureDate: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
        }),
      };
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
    const { department, periodStart, periodEnd } = filters;

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
    const { department, periodStart, periodEnd } = filters;

    // Diagnoses are primarily in psychology department
    if (department && department !== 'psychology') {
      throw new AppError('Diagnoses reports are only available for psychology department', 400);
    }

    // Get psychology records with diagnoses in the period
    const psychologyRecords = await prisma.psychologyRecord.findMany({
      where: {
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
        OR: [
          { currentDiagnosisDsm5: { not: null } },
          { currentDiagnosisCie10: { not: null } },
        ],
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
