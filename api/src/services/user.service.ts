import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { hashPassword } from '../utils/password';

export class UserService {
  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    phone?: string;
    role: string;
    enrollmentNumber?: string;
  }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError('Email ya registrado', 409);
    }
    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        phone: data.phone,
        role: data.role,
        enrollmentNumber: data.enrollmentNumber,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        phone: true,
        role: true,
        isActive: true,
        enrollmentNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  async getAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          phone: true,
          role: true,
          isActive: true,
          enrollmentNumber: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        phone: true,
        role: true,
        isActive: true,
        enrollmentNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async update(id: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: Date;
  }) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        phone: true,
        role: true,
        isActive: true,
        enrollmentNumber: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async delete(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role === 'admin') {
      throw new AppError('El administrador del sistema no puede ser eliminado', 403);
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false, updatedAt: new Date() },
    });

    return { message: 'User deactivated successfully' };
  }
}

export default new UserService();
