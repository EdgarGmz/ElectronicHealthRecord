import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { ROLES } from '../constants/roles';

export class NotificationService {
  async getAllActiveRecipients(data: {
    viewerRole: string
    limit: number
    search?: string
  }) {
    const { limit, search } = data

    const isUuidSearch = search ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search.trim()) : false

    const orFilters: Prisma.UserWhereInput[] = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]

    if (isUuidSearch) {
      orFilters.push({ id: { equals: search } })
    }

    const where: Prisma.UserWhereInput = {
      isActive: true,
      role: {
        in: [
          ROLES.COORDINADOR_ENFERMERIA,
          ROLES.ENFERMERO,
          ROLES.COORDINADOR_PSICOLOGIA,
          ROLES.PSICOLOGO,
        ],
      },
      ...(search
        ? {
            OR: orFilters,
          }
        : {}),
    }

    return prisma.user.findMany({
      where,
      take: limit,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        enrollmentNumber: true,
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    })
  }

  async getRecipientsByRelatedEntity(data: {
    userId: string
    userRole: string
    relatedEntityType: string
    relatedEntityId: string
  }) {
    const { userId, userRole, relatedEntityType, relatedEntityId } = data

    // Only implement the entities we can resolve in a consistent way.
    const isNursingCreator = userRole === ROLES.COORDINADOR_ENFERMERIA || userRole === ROLES.ENFERMERO
    const isPsychologyCreator = userRole === ROLES.COORDINADOR_PSICOLOGIA || userRole === ROLES.PSICOLOGO
    const isAdmin = userRole === ROLES.ADMIN

    const nursingAllowedRoles = [ROLES.COORDINADOR_ENFERMERIA, ROLES.ENFERMERO]
    const psychologyAllowedRoles = [ROLES.COORDINADOR_PSICOLOGIA, ROLES.PSICOLOGO]

    if (relatedEntityType === 'appointment') {
      const appointment = await prisma.appointment.findUnique({
        where: { id: relatedEntityId },
        select: {
          id: true,
          department: true,
          professionalId: true,
          patient: { select: { userId: true } },
        },
      })

      if (!appointment) {
        throw new AppError('Related appointment not found', 404)
      }

      // Access control, aligned with appointment.getById rules.
      if (userRole === ROLES.COORDINADOR_ENFERMERIA && appointment.department !== 'nursing') {
        throw new AppError('Access denied', 403)
      }
      if (userRole === ROLES.COORDINADOR_PSICOLOGIA && appointment.department !== 'psychology') {
        throw new AppError('Access denied', 403)
      }
      if (userRole === ROLES.ENFERMERO && appointment.professionalId !== userId) {
        throw new AppError('Access denied', 403)
      }
      if (userRole === ROLES.PSICOLOGO && appointment.professionalId !== userId) {
        throw new AppError('Access denied', 403)
      }

      const recipientIds = Array.from(
        new Set([appointment.professionalId, appointment.patient?.userId].filter(Boolean))
      ) as string[]

      if (recipientIds.length === 0) return []

      const users = await prisma.user.findMany({
        where: { id: { in: recipientIds } },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          enrollmentNumber: true,
        },
      })

      // Filtro por departamento/rol del creador (evita mostrar profesionales fuera del alcance).
      return users.filter((u) => {
        if (u.id === appointment.patient?.userId) return true // el paciente siempre puede ser destinatario
        if (isAdmin) return true
        if (isNursingCreator) return nursingAllowedRoles.includes(u.role as any)
        if (isPsychologyCreator) return psychologyAllowedRoles.includes(u.role as any)
        return false
      })
    }

    if (relatedEntityType === 'prescription') {
      const prescription = await prisma.prescription.findUnique({
        where: { id: relatedEntityId },
        select: {
          id: true,
          prescribedBy: true,
          patient: { select: { userId: true } },
        },
      })

      if (!prescription) throw new AppError('Related prescription not found', 404)

      const recipientIds = Array.from(
        new Set([prescription.prescribedBy, prescription.patient?.userId].filter(Boolean))
      ) as string[]

      if (recipientIds.length === 0) return []

      const users = await prisma.user.findMany({
        where: { id: { in: recipientIds } },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          enrollmentNumber: true,
        },
      })

      return users.filter((u) => {
        if (u.id === prescription.patient?.userId) return true
        if (isAdmin) return true
        if (isNursingCreator) return nursingAllowedRoles.includes(u.role as any)
        if (isPsychologyCreator) return psychologyAllowedRoles.includes(u.role as any)
        return false
      })
    }

    if (relatedEntityType === 'medication') {
      // Interpretación: relatedEntityId = Medication (catálogo).
      const medication = await prisma.medication.findUnique({
        where: { id: relatedEntityId },
        select: { id: true },
      })

      if (!medication) throw new AppError('Related medication not found', 404)

      // Medicamentos: destinatarios por defecto son enfermería.
      if (!isAdmin && !isNursingCreator) return []

      return prisma.user.findMany({
        where: { role: { in: nursingAllowedRoles }, isActive: true },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          enrollmentNumber: true,
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      })
    }

    if (relatedEntityType === 'interconsultation') {
      const ic = await prisma.interconsultation.findUnique({
        where: { id: relatedEntityId },
        select: {
          id: true,
          fromDepartment: true,
          toDepartment: true,
          fromProfessionalId: true,
          toProfessionalId: true,
          patient: { select: { userId: true } },
          fromProfessional: { select: { role: true } },
          toProfessional: { select: { role: true } },
        },
      })

      if (!ic) throw new AppError('Related interconsultation not found', 404)

      const nursingInvolved = ic.fromDepartment === 'Enfermería' || ic.toDepartment === 'Enfermería'
      const psychologyInvolved = ic.fromDepartment === 'Psicología' || ic.toDepartment === 'Psicología'

      if (!isAdmin) {
        if (isNursingCreator && !nursingInvolved) return []
        if (isPsychologyCreator && !psychologyInvolved) return []
      }

      const recipientIds = Array.from(
        new Set([ic.patient?.userId, ic.fromProfessionalId, ic.toProfessionalId].filter(Boolean))
      ) as string[]

      if (recipientIds.length === 0) return []

      const users = await prisma.user.findMany({
        where: { id: { in: recipientIds } },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          enrollmentNumber: true,
        },
      })

      return users.filter((u) => {
        // El paciente siempre lo incluimos como destinatario potencial
        if (u.id === ic.patient?.userId) return true
        if (isAdmin) return true
        if (isNursingCreator) return nursingAllowedRoles.includes(u.role as any)
        if (isPsychologyCreator) return psychologyAllowedRoles.includes(u.role as any)
        return false
      })
    }

    return []
  }

  async getRecentPrescriptions(limit: number = 20): Promise<Array<{ id: string; label: string }>> {
    const prescriptions = await prisma.prescription.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                enrollmentNumber: true,
              },
            },
          },
        },
        medication: {
          select: {
            name: true,
            genericName: true,
          },
        },
        prescribedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    })

    return prescriptions.map((p) => {
      const patientUser = p.patient?.user
      const prescriber = p.prescribedByUser
      const med = p.medication
      const dosage = p.dosage ?? ''
      const route = p.route ?? ''
      const patientName = patientUser ? `${patientUser.firstName} ${patientUser.lastName}`.trim() : '—'
      const prescriberName = prescriber ? `${prescriber.firstName} ${prescriber.lastName}`.trim() : '—'
      const medicationName = med?.name ?? med?.genericName ?? '—'
      return {
        id: p.id,
        label: `${patientName} · ${medicationName} · ${dosage} ${route}`.trim() + ` · ${prescriberName}`,
      }
    })
  }

  async getAll(
    userId: string,
    userRole: string,
    page: number = 1,
    limit: number = 10,
    filters?: {
      isRead?: boolean;
      type?: string;
      priority?: string;
    }
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.NotificationWhereInput = {};

    // Role-based filtering: users can only see their own notifications
    // Admins can see all notifications if needed
    if (userRole !== 'admin') {
      where.userId = userId;
    } else if (filters && 'userId' in filters) {
      // Allow admins to filter by specific userId if provided
      where.userId = (filters as any).userId;
    } else {
      // Default for admin: show all notifications
      // This can be adjusted based on requirements
      where.userId = userId; // For now, admins also see only their own
    }

    // Apply additional filters
    if (filters?.isRead !== undefined) {
      where.isRead = filters.isRead;
    }
    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.priority) {
      where.priority = filters.priority;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          fromUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string, userId: string, userRole: string) {
    const notification = await prisma.notification.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        fromUser: {
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

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    // Check access permissions - users can only access their own notifications
    if (userRole !== 'admin' && notification.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    return notification;
  }

  async create(data: {
    userId: string;
    fromUserId?: string;
    type: string;
    title: string;
    message: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    priority?: string;
  }) {
    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        fromUserId: data.fromUserId,
        type: data.type,
        title: data.title,
        message: data.message,
        relatedEntityType: data.relatedEntityType,
        relatedEntityId: data.relatedEntityId,
        priority: data.priority || 'normal',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        fromUser: {
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

    return notification;
  }

  async markAsRead(id: string, userId: string, userRole: string) {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    // Check access permissions
    if (userRole !== 'admin' && notification.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    // If already read, return as-is
    if (notification.isRead) {
      return notification;
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        fromUser: {
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

    return updatedNotification;
  }

  async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { count: result.count };
  }

  async delete(id: string, userId: string, userRole: string) {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    // Check access permissions
    if (userRole !== 'admin' && notification.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    await prisma.notification.delete({
      where: { id },
    });

    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return { count };
  }

  // Helper method to create notifications for multiple users
  // Note: This method does not validate individual user IDs for performance reasons
  // when creating many notifications. Ensure user IDs are valid before calling this method.
  async createBulk(notifications: Array<{
    userId: string;
    type: string;
    title: string;
    message: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    priority?: string;
  }>) {
    if (notifications.length === 0) {
      return { count: 0 };
    }

    // Extract unique user IDs and validate they exist
    const uniqueUserIds = [...new Set(notifications.map(n => n.userId))];
    const existingUsers = await prisma.user.findMany({
      where: { id: { in: uniqueUserIds } },
      select: { id: true },
    });

    const existingUserIds = new Set(existingUsers.map(u => u.id));
    const invalidUserIds = uniqueUserIds.filter(id => !existingUserIds.has(id));

    if (invalidUserIds.length > 0) {
      throw new AppError(`Invalid user IDs: ${invalidUserIds.join(', ')}`, 400);
    }

    const created = await prisma.notification.createMany({
      data: notifications.map(n => ({
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        relatedEntityType: n.relatedEntityType,
        relatedEntityId: n.relatedEntityId,
        priority: n.priority || 'normal',
      })),
    });

    return { count: created.count };
  }
}

export default new NotificationService();
