import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

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
    if (userRole === 'patient') {
      // Patients can only see their own appointments
      const patient = await prisma.patient.findUnique({
        where: { userId },
      });
      if (!patient) {
        throw new AppError('Patient profile not found', 404);
      }
      where.patientId = patient.id;
    } else if (userRole === 'psychologist' || userRole === 'nurse') {
      // Professionals can see appointments where they are assigned
      where.professionalId = userId;
    }
    // Admins and coordinators can see all appointments (no additional filter)

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
    if (userRole === 'patient') {
      const patient = await prisma.patient.findUnique({
        where: { userId },
      });
      if (!patient || appointment.patientId !== patient.id) {
        throw new AppError('Access denied', 403);
      }
    } else if (userRole === 'psychologist' || userRole === 'nurse') {
      if (appointment.professionalId !== userId) {
        throw new AppError('Access denied', 403);
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
    if (!['psychologist', 'nurse'].includes(professional.role)) {
      throw new AppError('Invalid professional role', 400);
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
        status: 'scheduled',
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
    if (userRole === 'patient') {
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
    } else if (userRole === 'psychologist' || userRole === 'nurse') {
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
    if (userRole === 'patient') {
      const patient = await prisma.patient.findUnique({
        where: { userId },
      });
      if (!patient || appointment.patientId !== patient.id) {
        throw new AppError('Access denied', 403);
      }
    } else if (userRole === 'psychologist' || userRole === 'nurse') {
      if (appointment.professionalId !== userId) {
        throw new AppError('Access denied', 403);
      }
    }

    // Cannot cancel already completed or cancelled appointments
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      throw new AppError(`Cannot cancel appointment with status: ${appointment.status}`, 400);
    }

    const cancelledAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: 'cancelled',
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
        in: ['scheduled', 'confirmed'],
      },
      OR: [
        {
          // Overlaps at the start
          scheduledDate: {
            lt: appointmentEnd,
          },
          AND: {
            scheduledDate: {
              gte: scheduledDate,
            },
          },
        },
        {
          // Overlaps at the end or completely contains
          scheduledDate: {
            lte: scheduledDate,
          },
        },
      ],
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

    // Check if any conflicting appointment actually overlaps
    for (const appt of conflictingAppointments) {
      const apptEnd = new Date(appt.scheduledDate.getTime() + appt.durationMinutes * 60000);
      if (
        (scheduledDate >= appt.scheduledDate && scheduledDate < apptEnd) ||
        (appointmentEnd > appt.scheduledDate && appointmentEnd <= apptEnd) ||
        (scheduledDate <= appt.scheduledDate && appointmentEnd >= apptEnd)
      ) {
        return true; // Conflict found
      }
    }

    return false; // No conflict
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
          in: ['scheduled', 'confirmed'],
        },
      },
      select: {
        scheduledDate: true,
        durationMinutes: true,
      },
    });

    // Calculate available time slots
    const availableSlots = [];
    for (const schedule of schedules) {
      const startTime = schedule.startTime;
      const endTime = schedule.endTime;
      
      // Generate slots (simplified - would need more sophisticated logic in production)
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
