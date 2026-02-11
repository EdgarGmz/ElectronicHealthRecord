import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class NotificationService {
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
        updatedAt: new Date(),
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
        updatedAt: new Date(),
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
  async createBulk(notifications: Array<{
    userId: string;
    type: string;
    title: string;
    message: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    priority?: string;
  }>) {
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
