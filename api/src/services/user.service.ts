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
    password?: string;
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
    const generatedPassword = data.password || (Math.random().toString(36).substring(2, 12) + 'A1!');
    const passwordHash = await hashPassword(generatedPassword);
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
        isConfirmed: true,
        enrollmentNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Send confirmation email asynchronously without blocking response
    emailService.sendConfirmationEmail(user.email, user.username, generatedPassword, confirmationToken)
      .catch((err) => {
        logger.error(`Error sending user confirmation email to ${user.email}:`, err);
      });

    return user;
  }

  async getAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    roleFilterParam?: string,
    status?: string,
    excludeDeactivated: boolean = false
  ) {
    const skip = (page - 1) * limit;

    const conditions: any[] = [];

    // Role filter
    if (roleFilterParam) {
      conditions.push({ role: roleFilterParam });
    } else {
      conditions.push({ role: { in: [...ROLES_VISIBLE_IN_USERS] } });
    }

    // Status filter
    if (status === 'active') {
      conditions.push({ isActive: true, isConfirmed: true });
    } else if (status === 'inactive') {
      conditions.push({ isActive: false });
    } else if (status === 'unconfirmed') {
      conditions.push({ isConfirmed: false });
    } else if (excludeDeactivated) {
      conditions.push({ isActive: true });
    }

    // Search filter
    if (search?.trim()) {
      conditions.push({
        OR: [
          { email: { contains: search.trim(), mode: 'insensitive' as const } },
          { firstName: { contains: search.trim(), mode: 'insensitive' as const } },
          { lastName: { contains: search.trim(), mode: 'insensitive' as const } },
        ],
      });
    }

    const where = { AND: conditions };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
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
          isConfirmed: true,
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
        username: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        phone: true,
        sex: true,
        role: true,
        isActive: true,
        isConfirmed: true,
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
        username: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        phone: true,
        role: true,
        isActive: true,
        isConfirmed: true,
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

    // Condición: el usuario debe estar desactivado (isActive === false) o no confirmado (isConfirmed === false)
    if (user.isActive && user.isConfirmed) {
      throw new AppError('Solo se pueden eliminar permanentemente usuarios desactivados o no confirmados', 400);
    }

    const [
      sessionsCount,
      appointmentsCount,
      schedulesCount,
      nursingConsultationsCount,
      nursingProceduresCount,
      medicationAdminsCount,
      prescriptionsCount,
      interconsultsCount,
      auditLogsCount,
      reportsCount,
      notificationsCount,
      blogPostsCount
    ] = await Promise.all([
      prisma.therapySession.count({ where: { therapistId: id } }),
      prisma.appointment.count({
        where: {
          OR: [
            { professionalId: id },
            { createdBy: id }
          ]
        }
      }),
      prisma.professionalSchedule.count({ where: { professionalId: id } }),
      prisma.nursingConsultation.count({ where: { nurseId: id } }),
      prisma.nursingProcedure.count({ where: { performedBy: id } }),
      prisma.medicationAdministration.count({ where: { administeredBy: id } }),
      prisma.prescription.count({ where: { prescribedBy: id } }),
      prisma.interconsultation.count({
        where: {
          OR: [
            { fromProfessionalId: id },
            { toProfessionalId: id },
            { respondedBy: id }
          ]
        }
      }),
      prisma.auditLog.count({ where: { userId: id } }),
      prisma.report.count({ where: { generatedBy: id } }),
      prisma.notification.count({
        where: {
          OR: [
            { userId: id },
            { fromUserId: id }
          ]
        }
      }),
      prisma.blogPost.count({ where: { authorId: id } }),
    ]);

    if (
      sessionsCount > 0 ||
      appointmentsCount > 0 ||
      schedulesCount > 0 ||
      nursingConsultationsCount > 0 ||
      nursingProceduresCount > 0 ||
      medicationAdminsCount > 0 ||
      prescriptionsCount > 0 ||
      interconsultsCount > 0 ||
      auditLogsCount > 0 ||
      reportsCount > 0 ||
      notificationsCount > 0 ||
      blogPostsCount > 0
    ) {
      throw new AppError(
        'No se puede eliminar permanentemente el usuario porque tiene registros de actividad asociados en el sistema (por ejemplo, consultas, citas, bitácoras, etc.).',
        400
      );
    }

    await prisma.$transaction([
      prisma.psychologistCareer.deleteMany({ where: { psychologistId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);
    return { message: 'Usuario eliminado permanentemente' };
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

  async resendConfirmation(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }
    if (user.isConfirmed) {
      throw new AppError('La cuenta ya está confirmada', 400);
    }

    const generatedPassword = Math.random().toString(36).substring(2, 12) + 'A1!';
    const passwordHash = await hashPassword(generatedPassword);
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const confirmationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        confirmationToken,
        confirmationTokenExpires,
        updatedAt: new Date(),
      },
    });

    emailService.sendConfirmationEmail(user.email, user.username, generatedPassword, confirmationToken)
      .catch((err) => {
        logger.error(`Error sending user confirmation email to ${user.email}:`, err);
      });
  }

  async resetPasswordByAdmin(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }
    if (user.role === ROLES.ADMIN) {
      throw new AppError('No se puede restablecer la contraseña del administrador principal', 403);
    }

    const generatedPassword = Math.random().toString(36).substring(2, 12) + 'A1!';
    const passwordHash = await hashPassword(generatedPassword);

    await prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        mustChangePassword: true,
        updatedAt: new Date(),
      },
    });

    emailService.sendPasswordResetByAdminEmail(user.email, user.username, generatedPassword)
      .catch((err) => {
        logger.error(`Error sending password reset by admin email to ${user.email}:`, err);
      });
  }
}

export default new UserService();
