import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { hashPassword, comparePassword } from '../utils/password';
import { ROLES_VISIBLE_IN_USERS, ROLES } from '../constants/roles';
import crypto from 'crypto';
import emailService from './email.service';
import logger from '../utils/logger';

async function generateUniqueUsername(firstName: string, lastName: string): Promise<string> {
  const cleanName = firstName.trim().split(' ')[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const cleanLastName = lastName.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const consonants = cleanLastName.replace(/[aeiouáéíóúü\s]/gi, '');
  const suffix = consonants.substring(0, 3);
  const capitalizedFirst = cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
  const capitalizedSuffix = suffix.toUpperCase();
  const base = `${capitalizedFirst}${capitalizedSuffix}`;

  let username = base;
  let counter = 1;
  while (true) {
    const existing = await prisma.user.findUnique({
      where: { username },
    });
    if (!existing) {
      break;
    }
    username = `${base}${counter}`;
    counter++;
  }
  return username;
}

export class UserService {
  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    phone?: string;
    sex?: string;
    role: string;
    enrollmentNumber?: string;
  }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError('Email ya registrado', 409);
    }

    const username = await generateUniqueUsername(data.firstName, data.lastName);
    const passwordHash = await hashPassword(data.password);
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const confirmationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await prisma.user.create({
      data: {
        email: data.email,
        username,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        phone: data.phone,
        sex: data.sex ?? null,
        role: data.role,
        enrollmentNumber: data.enrollmentNumber,
        isConfirmed: false,
        mustChangePassword: true,
        confirmationToken,
        confirmationTokenExpires,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        phone: true,
        sex: true,
        role: true,
        isActive: true,
        enrollmentNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Send confirmation email asynchronously without blocking response
    emailService.sendConfirmationEmail(user.email, user.username, data.password, confirmationToken)
      .catch((err) => {
        logger.error(`Error sending user confirmation email to ${user.email}:`, err);
      });

    return user;
  }

  async getAll(page: number = 1, limit: number = 10, search?: string, roleFilterParam?: string) {
    const skip = (page - 1) * limit;

    const roleFilter = roleFilterParam
      ? { role: roleFilterParam }
      : { role: { in: [...ROLES_VISIBLE_IN_USERS] } };
    const where = search?.trim()
      ? {
          AND: [
            roleFilter,
            {
              OR: [
                { email: { contains: search.trim(), mode: 'insensitive' as const } },
                { firstName: { contains: search.trim(), mode: 'insensitive' as const } },
                { lastName: { contains: search.trim(), mode: 'insensitive' as const } },
              ],
            },
          ],
        }
      : roleFilter;

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
          sex: true,
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
        sex: true,
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
    role?: string;
    isActive?: boolean;
  }) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Protect system admin from being deactivated or role-changed
    if (user.role === 'admin') {
      if (data.isActive === false) throw new AppError('El administrador del sistema no puede ser desactivado', 403);
      if (data.role && data.role !== 'admin') throw new AppError('El rol del administrador no puede ser modificado', 403);
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

  /** Elimina permanentemente un usuario psicólogo y sus asignaciones de carreras. No permite si tiene sesiones, citas o horarios. */
  async deletePermanently(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }
    if (user.role === ROLES.ADMIN) {
      throw new AppError('El administrador del sistema no puede ser eliminado', 403);
    }
    if (user.role !== ROLES.PSICOLOGO) {
      throw new AppError('Solo se puede eliminar permanentemente a usuarios con rol psicólogo', 403);
    }
    const [sessionsCount, appointmentsCount, schedulesCount] = await Promise.all([
      prisma.therapySession.count({ where: { therapistId: id } }),
      prisma.appointment.count({ where: { professionalId: id } }),
      prisma.professionalSchedule.count({ where: { professionalId: id } }),
    ]);
    if (sessionsCount > 0 || appointmentsCount > 0 || schedulesCount > 0) {
      throw new AppError(
        'No se puede eliminar: el psicólogo tiene sesiones, citas o horarios asignados. Desasigne o elimine esos registros primero.',
        400
      );
    }
    await prisma.$transaction([
      prisma.psychologistCareer.deleteMany({ where: { psychologistId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);
    return { message: 'Psicólogo eliminado permanentemente' };
  }

  async changePassword(userId: string, data: { currentPassword?: string; newPassword?: string }) {
    const { currentPassword, newPassword } = data;
    if (!currentPassword || !newPassword) {
      throw new AppError('Se requieren la contraseña actual y la nueva contraseña.', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('La contraseña actual es incorrecta.', 400);
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustChangePassword: false,
      },
    });

    return { message: 'Contraseña cambiada con éxito.' };
  }
}

export default new UserService();
