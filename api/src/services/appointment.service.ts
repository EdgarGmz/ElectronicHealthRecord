import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { APPOINTMENT_STATUS } from '../constants/appointment';
import { ROLES, ROLES_PROFESSIONAL_APPOINTMENT } from '../constants/roles';
import notificationService from './notification.service';
import { NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES } from '../constants/notification';
import { formatDateToSpanish } from '../utils/date-formatter';
import psychologistCareerService from './psychologist-career.service';

const PATIENT_TYPES_GENERAL = ['faculty', 'administrative'] as const;

export class AppointmentService {
  async getAll(
    userId: string,
    userRole: string,
    page: number = 1,
    limit: number = 10,
    filters?: {
      patientId?: string;
      professionalId?: string;
      status?: string;
      department?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.AppointmentWhereInput = {};

    // Apply role-based filtering
    if (userRole === ROLES.PATIENT) {
      const patient = await prisma.patient.findUnique({
        where: { userId },
      });
      if (!patient) {
        throw new AppError('Patient profile not found', 404);
      }
      where.patientId = patient.id;
    } else if (userRole === ROLES.PSICOLOGO || userRole === ROLES.ENFERMERO) {
      where.professionalId = userId;
      if (userRole === ROLES.PSICOLOGO) {
        const assignedCareerIds = await psychologistCareerService.getAssignedCareerIds(userId);
        where.patient = {
          OR: [
            { patientType: { in: [...PATIENT_TYPES_GENERAL] } },
            ...(assignedCareerIds.length ? [{ patientType: 'student', careerId: { in: assignedCareerIds } }] : []),
          ],
        };
      }
    }
    // Admin y coordinadores ven todas las citas

    // Apply additional filters
    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }
    if (filters?.professionalId) {
      where.professionalId = filters.professionalId;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.department) {
      where.department = filters.department;
    }
    if (filters?.startDate || filters?.endDate) {
      where.scheduledDate = {};
      if (filters.startDate) {
        where.scheduledDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.scheduledDate.lte = filters.endDate;
      }
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          professional: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { scheduledDate: 'desc' },
      }),
      prisma.appointment.count({ where }),
    ]);

    return {
      appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string, userId: string, userRole: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                enrollmentNumber: true,
              },
            },
          },
        },
        professional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        reminders: true,
      },
    });

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    // Check access permissions
    if (userRole === ROLES.PATIENT) {
      const patient = await prisma.patient.findUnique({
        where: { userId },
      });
      if (!patient || appointment.patientId !== patient.id) {
        throw new AppError('Access denied', 403);
      }
    } else if (userRole === ROLES.PSICOLOGO || userRole === ROLES.ENFERMERO) {
      if (appointment.professionalId !== userId) {
        throw new AppError('Access denied', 403);
      }
      if (userRole === ROLES.PSICOLOGO) {
        const patient = appointment.patient as { patientType: string; careerId: string };
        const assignedCareerIds = await psychologistCareerService.getAssignedCareerIds(userId);
        const isGeneral = PATIENT_TYPES_GENERAL.includes(patient.patientType as (typeof PATIENT_TYPES_GENERAL)[number]);
        const isStudentInScope =
          patient.patientType === 'student' && assignedCareerIds.length > 0 && assignedCareerIds.includes(patient.careerId);
        if (!isGeneral && !isStudentInScope) {
          throw new AppError(
            'Acceso denegado: solo puede ver citas de estudiantes de sus carreras asignadas o personal docente/administrativo',
            403
          );
        }
      }
    } else if (userRole === 'coordinador_enfermeria') {
      if (appointment.department !== 'nursing') {
        throw new AppError('Acceso denegado: solo puede ver citas del departamento de enfermería', 403);
      }
    }

    return appointment;
  }

  async create(data: {
    patientId: string;
    professionalId: string;
    appointmentType: string;
    department: string;
    scheduledDate: Date;
    durationMinutes: number;
    notes?: string;
    createdBy: string;
  }) {
    // Validate patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId },
    });
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    // Validate professional exists and has appropriate role
    const professional = await prisma.user.findUnique({
      where: { id: data.professionalId },
    });
    if (!professional) {
      throw new AppError('Professional not found', 404);
    }
    if (!ROLES_PROFESSIONAL_APPOINTMENT.includes(professional.role as any)) {
      throw new AppError('El profesional debe ser psicólogo o enfermero', 400);
    }

    if (professional.role === ROLES.PSICOLOGO) {
      const assignedCareerIds = await psychologistCareerService.getAssignedCareerIds(professional.id);
      const isGeneral = PATIENT_TYPES_GENERAL.includes(patient.patientType as (typeof PATIENT_TYPES_GENERAL)[number]);
      const isStudentInScope =
        patient.patientType === 'student' && assignedCareerIds.length > 0 && assignedCareerIds.includes(patient.careerId);
      if (!isGeneral && !isStudentInScope) {
        throw new AppError(
          'El psicólogo solo puede agendar citas con estudiantes de sus carreras asignadas o con personal docente/administrativo',
          403
        );
      }
    }

    // Check for conflicting appointments
    const conflictingAppointment = await this.checkAvailability(
      data.professionalId,
      data.scheduledDate,
      data.durationMinutes
    );
    if (conflictingAppointment) {
      throw new AppError('Professional is not available at this time', 409);
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: data.patientId,
        professionalId: data.professionalId,
        appointmentType: data.appointmentType,
        department: data.department,
        scheduledDate: data.scheduledDate,
        durationMinutes: data.durationMinutes,
        status: APPOINTMENT_STATUS.SCHEDULED,
        notes: data.notes,
        createdBy: data.createdBy,
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        professional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Create notifications for patient and professional
    const dateString = formatDateToSpanish(appointment.scheduledDate);

    await notificationService.createBulk([
      {
        userId: appointment.patient.userId,
        type: NOTIFICATION_TYPES.APPOINTMENT_CREATED,
        title: 'Nueva cita programada',
        message: `Se ha programado una cita de ${appointment.appointmentType} para el ${dateString}.`,
        relatedEntityType: 'appointment',
        relatedEntityId: appointment.id,
        priority: NOTIFICATION_PRIORITIES.NORMAL,
      },
      {
        userId: appointment.professionalId,
        type: NOTIFICATION_TYPES.APPOINTMENT_CREATED,
        title: 'Nueva cita asignada',
        message: `Se ha asignado una cita con ${appointment.patient.user.firstName} ${appointment.patient.user.lastName} para el ${dateString}.`,
        relatedEntityType: 'appointment',
        relatedEntityId: appointment.id,
        priority: NOTIFICATION_PRIORITIES.NORMAL,
      },
    ]);

    return appointment;
  }

  async update(
    id: string,
    userId: string,
    userRole: string,
    data: {
      scheduledDate?: Date;
      durationMinutes?: number;
      status?: string;
      notes?: string;
    }
  ) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    // Check permissions
    if (userRole === ROLES.PATIENT) {
      const patient = await prisma.patient.findUnique({
        where: { userId },
      });
      if (!patient || appointment.patientId !== patient.id) {
        throw new AppError('Access denied', 403);
      }
      // Patients can only update notes or request cancellation
      if (data.scheduledDate || data.durationMinutes) {
        throw new AppError('Patients cannot reschedule appointments directly', 403);
      }
    } else if (userRole === ROLES.PSICOLOGO || userRole === ROLES.ENFERMERO) {
      if (appointment.professionalId !== userId) {
        throw new AppError('Access denied', 403);
      }
    }

    // If rescheduling, check availability
    if (data.scheduledDate && data.scheduledDate.getTime() !== appointment.scheduledDate.getTime()) {
      const durationMinutes = data.durationMinutes || appointment.durationMinutes;
      const conflictingAppointment = await this.checkAvailability(
        appointment.professionalId,
        data.scheduledDate,
        durationMinutes,
        id
      );
      if (conflictingAppointment) {
        throw new AppError('Professional is not available at the new time', 409);
      }
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        professional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Send notification if appointment was rescheduled
    if (data.scheduledDate && data.scheduledDate.getTime() !== appointment.scheduledDate.getTime()) {
      const dateString = formatDateToSpanish(updatedAppointment.scheduledDate);

      await notificationService.createBulk([
        {
          userId: updatedAppointment.patient.userId,
          type: NOTIFICATION_TYPES.APPOINTMENT_UPDATED,
          title: 'Cita reprogramada',
          message: `Su cita ha sido reprogramada para el ${dateString}.`,
          relatedEntityType: 'appointment',
          relatedEntityId: updatedAppointment.id,
          priority: NOTIFICATION_PRIORITIES.HIGH,
        },
        {
          userId: updatedAppointment.professionalId,
          type: NOTIFICATION_TYPES.APPOINTMENT_UPDATED,
          title: 'Cita reprogramada',
          message: `La cita con ${updatedAppointment.patient.user.firstName} ${updatedAppointment.patient.user.lastName} ha sido reprogramada para el ${dateString}.`,
          relatedEntityType: 'appointment',
          relatedEntityId: updatedAppointment.id,
          priority: NOTIFICATION_PRIORITIES.HIGH,
        },
      ]);
    }

    return updatedAppointment;
  }

  async cancel(
    id: string,
    userId: string,
    userRole: string,
    cancellationReason: string
  ) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    // Check permissions
    if (userRole === ROLES.PATIENT) {
      const patient = await prisma.patient.findUnique({
        where: { userId },
      });
      if (!patient || appointment.patientId !== patient.id) {
        throw new AppError('Access denied', 403);
      }
    } else if (userRole === ROLES.PSICOLOGO || userRole === ROLES.ENFERMERO) {
      if (appointment.professionalId !== userId) {
        throw new AppError('Access denied', 403);
      }
    }

    // Cannot cancel already completed or cancelled appointments
    if (
      appointment.status === APPOINTMENT_STATUS.COMPLETED ||
      appointment.status === APPOINTMENT_STATUS.CANCELLED
    ) {
      throw new AppError(`Cannot cancel appointment with status: ${appointment.status}`, 400);
    }

    const cancelledAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: APPOINTMENT_STATUS.CANCELLED,
        cancellationReason,
        updatedAt: new Date(),
      },
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
        professional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Send cancellation notifications
    const dateString = formatDateToSpanish(cancelledAppointment.scheduledDate);

    await notificationService.createBulk([
      {
        userId: cancelledAppointment.patient.userId,
        type: NOTIFICATION_TYPES.APPOINTMENT_CANCELLED,
        title: 'Cita cancelada',
        message: `Su cita del ${dateString} ha sido cancelada. Motivo: ${cancellationReason}`,
        relatedEntityType: 'appointment',
        relatedEntityId: cancelledAppointment.id,
        priority: NOTIFICATION_PRIORITIES.HIGH,
      },
      {
        userId: cancelledAppointment.professionalId,
        type: NOTIFICATION_TYPES.APPOINTMENT_CANCELLED,
        title: 'Cita cancelada',
        message: `La cita con ${cancelledAppointment.patient.user.firstName} ${cancelledAppointment.patient.user.lastName} del ${dateString} ha sido cancelada.`,
        relatedEntityType: 'appointment',
        relatedEntityId: cancelledAppointment.id,
        priority: NOTIFICATION_PRIORITIES.HIGH,
      },
    ]);

    return cancelledAppointment;
  }

  async checkAvailability(
    professionalId: string,
    scheduledDate: Date,
    durationMinutes: number,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    const appointmentEnd = new Date(scheduledDate.getTime() + durationMinutes * 60000);

    const where: Prisma.AppointmentWhereInput = {
      professionalId,
      status: {
        in: [APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.CONFIRMED],
      },
    };

    if (excludeAppointmentId) {
      where.id = { not: excludeAppointmentId };
    }

    const conflictingAppointments = await prisma.appointment.findMany({
      where,
      select: {
        id: true,
        scheduledDate: true,
        durationMinutes: true,
      },
    });

    // Check if any existing appointment overlaps with the new appointment time slot
    for (const appt of conflictingAppointments) {
      const apptEnd = new Date(appt.scheduledDate.getTime() + appt.durationMinutes * 60000);
      
      // Two appointments overlap if:
      // 1. New appointment starts during existing appointment
      // 2. New appointment ends during existing appointment  
      // 3. New appointment completely contains existing appointment
      const overlaps = 
        (scheduledDate >= appt.scheduledDate && scheduledDate < apptEnd) ||
        (appointmentEnd > appt.scheduledDate && appointmentEnd <= apptEnd) ||
        (scheduledDate <= appt.scheduledDate && appointmentEnd >= apptEnd);
      
      if (overlaps) {
        return true; // Conflict found
      }
    }

    return false; // No conflict
  }

  /** List professionals that can be assigned to appointments (psicologo, enfermero). */
  async getProfessionals() {
    const users = await prisma.user.findMany({
      where: {
        role: { in: [...ROLES_PROFESSIONAL_APPOINTMENT] },
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
    return users;
  }

  async getAvailability(
    professionalId: string,
    date: Date
  ) {
    // Validate professional exists
    const professional = await prisma.user.findUnique({
      where: { id: professionalId },
    });
    if (!professional) {
      throw new AppError('Professional not found', 404);
    }

    // Get professional's schedule for this day
    const dayOfWeek = date.getDay();
    const schedules = await prisma.professionalSchedule.findMany({
      where: {
        professionalId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (schedules.length === 0) {
      return {
        available: false,
        message: 'Professional does not work on this day',
        slots: [],
      };
    }

    // Get all appointments for this professional on this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        professionalId,
        scheduledDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: [APPOINTMENT_STATUS.SCHEDULED, APPOINTMENT_STATUS.CONFIRMED],
        },
      },
      select: {
        scheduledDate: true,
        durationMinutes: true,
      },
    });

    // NOTE: This is a simplified implementation that returns the professional's schedule blocks
    // A complete implementation would:
    // 1. Generate individual time slots based on appointment duration (e.g., 30-min or 50-min slots)
    // 2. Mark each slot as available or booked based on existing appointments
    // 3. Consider breaks and buffer time between appointments
    // 4. Account for different appointment types and their durations
    const availableSlots = [];
    for (const schedule of schedules) {
      const startTime = schedule.startTime;
      const endTime = schedule.endTime;
      
      availableSlots.push({
        start: startTime,
        end: endTime,
        available: true,
      });
    }

    return {
      available: availableSlots.length > 0,
      date,
      professional: {
        id: professional.id,
        name: `${professional.firstName} ${professional.lastName}`,
      },
      slots: availableSlots,
      bookedAppointments: appointments.length,
    };
  }
}

export default new AppointmentService();
