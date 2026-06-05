import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
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

export class AuthService {
  async login(username: string, password: string) {
    const normalizedUsername = username.trim();
    const user = await prisma.user.findFirst({
      where: { username: { equals: normalizedUsername, mode: 'insensitive' } },
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isConfirmed: true,
        mustChangePassword: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is inactive', 403);
    }

    if (!user.isConfirmed) {
      throw new AppError('Debes confirmar tu cuenta por correo electrónico primero.', 403);
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
      accessToken,
      refreshToken,
    };
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    phone?: string;
    role: string;
    enrollmentNumber?: string;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const username = await generateUniqueUsername(data.firstName, data.lastName);
    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        username,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        phone: data.phone,
        role: data.role,
        enrollmentNumber: data.enrollmentNumber,
        isConfirmed: true,
        mustChangePassword: false,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        throw new AppError('Invalid refresh token', 401);
      }

      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return { accessToken };
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  async confirmAccount(token: string) {
    const user = await prisma.user.findFirst({
      where: {
        confirmationToken: token,
        confirmationTokenExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new AppError('El enlace de confirmación es inválido o ha expirado.', 400);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isConfirmed: true,
        confirmationToken: null,
        confirmationTokenExpires: null,
      },
    });

    return { message: 'Cuenta confirmada con éxito. Ya puedes iniciar sesión.' };
  }

  async forgotPassword(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });

    if (user) {
      const resetPasswordToken = crypto.randomBytes(32).toString('hex');
      const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken,
          resetPasswordExpires,
        },
      });

      // Send email
      emailService.sendPasswordResetEmail(user.email, user.username, resetPasswordToken).catch((err) => {
        logger.error(`Error sending password reset email:`, err);
      });
    }

    // Always return the same generic message for security
    return {
      message: 'Si el correo electrónico está registrado en nuestro sistema, recibirás un enlace para restablecer tu contraseña en unos momentos.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new AppError('El token de restablecimiento de contraseña es inválido o ha expirado.', 400);
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        mustChangePassword: false,
      },
    });

    return { message: 'Contraseña restablecida con éxito. Ya puedes iniciar sesión con tu nueva contraseña.' };
  }
}

export default new AuthService();
