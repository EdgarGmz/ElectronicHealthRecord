import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class CareerService {
  /**
   * Obtiene la lista de carreras activas.
   * Usado para dropdowns y listados públicos de personal.
   */
  async getAllActive() {
    return prisma.career.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Obtiene la lista completa de carreras para el panel de administración,
   * incluyendo carreras inactivas y el conteo de alumnos asociados.
   */
  async getAllAdmin() {
    return prisma.career.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { patients: true },
        },
      },
    });
  }

  /**
   * Obtiene los detalles de una carrera específica por su ID.
   */
  async getById(id: string) {
    const career = await prisma.career.findUnique({
      where: { id },
      include: {
        _count: {
          select: { patients: true },
        },
      },
    });
    if (!career) {
      throw new AppError('Carrera no encontrada', 404);
    }
    return career;
  }

  /**
   * Crea una nueva carrera universitaria.
   */
  async create(data: { name: string; code: string }) {
    const nameTrimmed = data.name.trim();
    const codeTrimmed = data.code.trim();

    // Validar unicidad del nombre
    const existingName = await prisma.career.findFirst({
      where: { name: { equals: nameTrimmed, mode: 'insensitive' } },
    });
    if (existingName) {
      throw new AppError('El nombre de la carrera ya está registrado', 400);
    }

    // Validar unicidad de las siglas (code)
    const existingCode = await prisma.career.findFirst({
      where: { code: { equals: codeTrimmed, mode: 'insensitive' } },
    });
    if (existingCode) {
      throw new AppError('Las siglas de la carrera ya están registradas', 400);
    }

    return prisma.career.create({
      data: {
        name: nameTrimmed,
        code: codeTrimmed,
        isActive: true,
      },
    });
  }

  /**
   * Actualiza los datos de una carrera universitaria.
   */
  async update(id: string, data: { name?: string; code?: string; isActive?: boolean }) {
    const career = await prisma.career.findUnique({ where: { id } });
    if (!career) {
      throw new AppError('Carrera no encontrada', 404);
    }

    const updateData: Prisma.CareerUpdateInput = {};

    if (data.name !== undefined) {
      const nameTrimmed = data.name.trim();
      if (nameTrimmed.toLowerCase() !== career.name.toLowerCase()) {
        const existingName = await prisma.career.findFirst({
          where: { name: { equals: nameTrimmed, mode: 'insensitive' } },
        });
        if (existingName) {
          throw new AppError('El nombre de la carrera ya está registrado', 400);
        }
        updateData.name = nameTrimmed;
      }
    }

    if (data.code !== undefined) {
      const codeTrimmed = data.code.trim();
      if (!career.code || codeTrimmed.toLowerCase() !== career.code.toLowerCase()) {
        const existingCode = await prisma.career.findFirst({
          where: { code: { equals: codeTrimmed, mode: 'insensitive' } },
        });
        if (existingCode) {
          throw new AppError('Las siglas de la carrera ya están registradas', 400);
        }
        updateData.code = codeTrimmed;
      }
    }

    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    updateData.updatedAt = new Date();

    return prisma.career.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Elimina una carrera de la base de datos si no tiene alumnos vinculados.
   */
  async delete(id: string) {
    const career = await prisma.career.findUnique({
      where: { id },
      include: {
        _count: {
          select: { patients: true },
        },
      },
    });

    if (!career) {
      throw new AppError('Carrera no encontrada', 404);
    }

    // Si tiene alumnos vinculados, no permitimos la eliminación física.
    if (career._count.patients > 0) {
      throw new AppError('No se puede eliminar la carrera porque tiene alumnos registrados. Desactívela en su lugar.', 400);
    }

    await prisma.career.delete({
      where: { id },
    });

    return { message: 'Carrera eliminada con éxito' };
  }
}

export default new CareerService();
