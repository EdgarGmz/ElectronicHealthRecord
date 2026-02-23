import { Prisma } from '@prisma/client';
import prisma from '../config/database';

export class AuditLogService {
  /**
   * Create a new audit log entry
   */
  createAuditLog(data: {
    userId: string;
    action: string;
    tableName: string;
    recordId: string;
    oldValues?: object;
    newValues?: object;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        tableName: data.tableName,
        recordId: data.recordId,
        oldValues: data.oldValues ? (data.oldValues as Prisma.InputJsonValue) : Prisma.JsonNull,
        newValues: data.newValues ? (data.newValues as Prisma.InputJsonValue) : Prisma.JsonNull,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      },
    });
  }

  /**
   * Get audit logs with filtering and pagination.
   * Si userRole es coordinador_psicologia, solo se devuelven logs de usuarios del departamento de psicología (psicologo, coordinador_psicologia).
   */
  async getAuditLogs(
    page: number = 1,
    limit: number = 10,
    filters?: {
      userId?: string;
      action?: string;
      tableName?: string;
      startDate?: Date;
      endDate?: Date;
    },
    userRole?: string
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (userRole === 'coordinador_psicologia') {
      where.user = { role: { in: ['coordinador_psicologia', 'psicologo'] } };
    }
    if (userRole === 'coordinador_enfermeria') {
      where.user = { role: { in: ['coordinador_enfermeria', 'enfermero'] } };
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.action) {
      where.action = filters.action;
    }

    if (filters?.tableName) {
      where.tableName = filters.tableName;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      auditLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export default new AuditLogService();
