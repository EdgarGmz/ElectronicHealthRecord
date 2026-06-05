import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { APPOINTMENT_STATUS } from '../constants/appointment';
import { ROLES, ROLES_PROFESSIONAL_APPOINTMENT } from '../constants/roles';
import notificationService from './notification.service';
import { NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES } from '../constants/notification';
import { formatDateToSpanish } from '../utils/date-formatter';
import psychologistCareerService from './psychologist-career.service';
import patientService from './patient.service';
import emailService from './email.service';
import logger from '../utils/logger';

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
      search?: string;
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
    if (filters?.search) {
      const term = filters.search.trim();
      const searchCondition: Prisma.AppointmentWhereInput = {
        patient: {
          user: {
            OR: [
              { firstName: { contains: term, mode: 'insensitive' } },
              { lastName: { contains: term, mode: 'insensitive' } },
              { email: { contains: term, mode: 'insensitive' } },
            ],
          },
        },
      };
      where.AND = [...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []), searchCondition];
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

    // Restricción por carrera (estudiantes): el psicólogo solo puede agendar con estudiantes de sus carreras asignadas.
    // Excepción: personal docente y administrativo (faculty, administrative) puede ser agendado por cualquier psicólogo.
    if (professional.role === ROLES.PSICOLOGO) {
      const assignedCareerIds = await psychologistCareerService.getAssignedCareerIds(professional.id);
      const isGeneral = PATIENT_TYPES_GENERAL.includes(patient.patientType as (typeof PATIENT_TYPES_GENERAL)[number]);
      const isStudentInScope =
        patient.patientType === 'student' &&
        assignedCareerIds.length > 0 &&
        patient.careerId != null &&
        assignedCareerIds.includes(patient.careerId);
      if (!isGeneral && !isStudentInScope) {
        throw new AppError(
          'El psicólogo solo puede agendar citas con estudiantes de sus carreras asignadas o con personal docente/administrativo',
          403
        );
      }
    }

    // Check for conflicting appointments
    const availability = await this.checkAvailability(
      data.professionalId,
      data.scheduledDate,
      data.durationMinutes
    );
    if (!availability.available) {
      throw new AppError('Professional is not available at this time', 409, {
        conflict: {
          start: availability.blockedRange.start.toISOString(),
          end: availability.blockedRange.end.toISOString(),
        },
      });
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
      rescheduleReason?: string;
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

    const isRescheduling =
      !!data.scheduledDate && data.scheduledDate.getTime() !== appointment.scheduledDate.getTime();

    // If rescheduling, check availability
    if (isRescheduling) {
      const durationMinutes = data.durationMinutes || appointment.durationMinutes;
      const newScheduledDate = data.scheduledDate as Date;
      const availability = await this.checkAvailability(
        appointment.professionalId,
        newScheduledDate,
        durationMinutes,
        id
      );
      if (!availability.available) {
        throw new AppError('Professional is not available at the new time', 409, {
          conflict: {
            start: availability.blockedRange.start.toISOString(),
            end: availability.blockedRange.end.toISOString(),
          },
        });
      }
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...data,
        // When rescheduling, clear cancellation reason (if any) to keep consistency.
        ...(isRescheduling ? { cancellationReason: null } : {}),
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
    if (isRescheduling) {
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

    // Notify waiting list patients
    try {
      const waitingListEntries = await prisma.waitingList.findMany({
        where: {
          department: cancelledAppointment.department,
          status: 'espera',
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
                },
              },
            },
          },
        },
      });

      if (waitingListEntries.length > 0) {
        const waitingNotifications = waitingListEntries.map((entry) => ({
          userId: entry.patient.userId,
          type: NOTIFICATION_TYPES.SYSTEM_ALERT,
          title: 'Espacio disponible',
          message: `Se ha liberado un espacio en el departamento de ${cancelledAppointment.department === 'psicologia' ? 'Psicología' : 'Enfermería'}. Ponte en contacto para agendar tu cita.`,
          relatedEntityType: 'appointment',
          relatedEntityId: cancelledAppointment.id,
          priority: NOTIFICATION_PRIORITIES.HIGH,
        }));
        await notificationService.createBulk(waitingNotifications);

        for (const entry of waitingListEntries) {
          emailService.sendWaitingListNotification(
            entry.patient.user.email,
            entry.patient.user.firstName,
            cancelledAppointment.department
          ).catch((err) => {
            logger.error(`Error sending waiting list notification email to ${entry.patient.user.email}:`, err);
          });
        }
      }
    } catch (err) {
      logger.error('Error processing waiting list notifications on appointment cancellation:', err);
    }

    return cancelledAppointment;
  }

  async checkAvailability(
    professionalId: string,
    scheduledDate: Date,
    durationMinutes: number,
    excludeAppointmentId?: string
  ): Promise<
    | { available: true }
    | { available: false; blockedRange: { start: Date; end: Date } }
  > {
    // Reglas de duración:
    // - En promedio las citas duran ~45 min (reservamos mínimo 45)
    // - En el peor caso pueden durar hasta 90 min (reservamos máximo 90)
    // Esto reduce empalmes en la agenda cuando la duración real varía.
    const EFFECTIVE_MIN_DURATION = 45
    const EFFECTIVE_MAX_DURATION = 90
    const clampDuration = (d: number) => Math.min(EFFECTIVE_MAX_DURATION, Math.max(EFFECTIVE_MIN_DURATION, d))

    const effectiveNewDuration = clampDuration(durationMinutes)
    const appointmentEnd = new Date(scheduledDate.getTime() + effectiveNewDuration * 60000);

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

    const overlapping: Array<{ id: string; start: Date; end: Date }> = []

    // Check if any existing appointment overlaps with the new appointment time slot
    for (const appt of conflictingAppointments) {
      const effectiveExistingDuration = clampDuration(appt.durationMinutes)
      const apptEnd = new Date(appt.scheduledDate.getTime() + effectiveExistingDuration * 60000);
      
      // Two appointments overlap if:
      // 1. New appointment starts during existing appointment
      // 2. New appointment ends during existing appointment  
      // 3. New appointment completely contains existing appointment
      const overlaps = 
        (scheduledDate >= appt.scheduledDate && scheduledDate < apptEnd) ||
        (appointmentEnd > appt.scheduledDate && appointmentEnd <= apptEnd) ||
        (scheduledDate <= appt.scheduledDate && appointmentEnd >= apptEnd);
      
      if (overlaps) {
        overlapping.push({ id: appt.id, start: appt.scheduledDate, end: apptEnd })
      }
    }

    if (overlapping.length > 0) {
      const blockedStart = new Date(Math.min(...overlapping.map((o) => o.start.getTime())))
      const blockedEnd = new Date(Math.max(...overlapping.map((o) => o.end.getTime())))
      return { available: false, blockedRange: { start: blockedStart, end: blockedEnd } }
    }

    return { available: true }
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

  async getQueue(userId: string, userRole: string) {
    const whereClause: any = {
      status: 'espera',
    };

    if (userRole === ROLES.PSICOLOGO) {
      whereClause.department = 'psicologia';
      const assignedCareers = await prisma.psychologistCareer.findMany({
        where: { psychologistId: userId },
      });
      const careerIds = assignedCareers.map((c) => c.careerId);
      whereClause.patient = {
        careerId: { in: careerIds },
      };
    } else if (userRole === ROLES.COORDINADOR_PSICOLOGIA) {
      whereClause.department = 'psicologia';
    } else if (userRole === ROLES.ENFERMERO || userRole === ROLES.COORDINADOR_ENFERMERIA) {
      whereClause.department = 'enfermeria';
    }

    return prisma.waitingList.findMany({
      where: whereClause,
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
            career: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async joinQueue(data: {
    enrollmentNumber?: string;
    firstName: string;
    lastName: string;
    careerId?: string;
    email?: string;
    phone?: string;
    age?: number;
    sex?: string;
    department?: string;
    reason?: string;
  }) {
    let patient = null;

    if (data.enrollmentNumber || data.email) {
      const orConditions = [];
      if (data.enrollmentNumber) orConditions.push({ user: { enrollmentNumber: data.enrollmentNumber } });
      if (data.email) orConditions.push({ user: { email: data.email } });

      patient = await prisma.patient.findFirst({
        where: { OR: orConditions },
        include: { user: true },
      });
    }

    if (!patient) {
      const tempEmail = data.email || `anonimo.${Date.now()}.${Math.floor(Math.random() * 1000)}@utcare.local`;
      const tempEnrollment = data.enrollmentNumber || `ANON-${Date.now()}`;
      const dob = data.age
        ? new Date(Date.now() - data.age * 365.25 * 24 * 60 * 60 * 1000)
        : new Date('2000-01-01');

      patient = await patientService.create({
        email: tempEmail,
        firstName: data.firstName || 'Anónimo',
        lastName: data.lastName || 'Anónimo',
        dateOfBirth: dob,
        phone: data.phone,
        sex: data.sex || 'other',
        enrollmentNumber: tempEnrollment,
        patientType: 'student',
        careerId: data.careerId || null,
      });
    }

    const waitingEntry = await prisma.waitingList.create({
      data: {
        patientId: patient.id,
        department: data.department || 'psicologia',
        priority: 'media',
        status: 'espera',
        reason: data.reason || 'Registro en Kiosko',
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            career: true,
          },
        },
      },
    });

    return waitingEntry;
  }
}

export default new AppointmentService();
