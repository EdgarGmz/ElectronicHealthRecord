import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { ROLES } from '../constants/roles';

/**
 * Relación N:M Psicólogo-Carreras. Un psicólogo puede tener una o varias carreras bajo su cargo.
 * Solo puede atender estudiantes de esas carreras; personal docente y administrativo puede ser atendido por cualquier psicólogo.
 */
export class PsychologistCareerService {
  async getAssignedCareerIds(psychologistId: string): Promise<string[]> {
    const assignments = await prisma.psychologistCareer.findMany({
      where: { psychologistId },
      select: { careerId: true },
    });
    return assignments.map((a) => a.careerId);
  }

  /** Para listados: devuelve por cada psicólogo las carreras asignadas (id + nombre). */
  async getCareersByPsychologistIds(
    psychologistIds: string[]
  ): Promise<Record<string, { id: string; name: string }[]>> {
    if (psychologistIds.length === 0) return {};
    const assignments = await prisma.psychologistCareer.findMany({
      where: { psychologistId: { in: psychologistIds } },
      select: {
        psychologistId: true,
        career: { select: { id: true, name: true } },
      },
    });
    const map: Record<string, { id: string; name: string }[]> = {};
    for (const id of psychologistIds) map[id] = [];
    for (const a of assignments) {
      map[a.psychologistId].push({ id: a.career.id, name: a.career.name });
    }
    return map;
  }

  /**
   * Lista todas las carreras activas con el id del psicólogo asignado (null si no está asignada).
   * Una carrera solo puede estar asignada a un psicólogo; para el modal hay que deshabilitar las ya asignadas a otros.
   */
  async getCareersWithAssignments(): Promise<
    { id: string; name: string; code: string | null; assignedToPsychologistId: string | null }[]
  > {
    const careers = await prisma.career.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    });
    const assignments = await prisma.psychologistCareer.findMany({
      select: { careerId: true, psychologistId: true },
    });
    const byCareer = new Map(assignments.map((a) => [a.careerId, a.psychologistId]));
    return careers.map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      assignedToPsychologistId: byCareer.get(c.id) ?? null,
    }));
  }

  /**
   * Reemplaza las carreras asignadas a un psicólogo. Solo coordinador o admin.
   * Regla: cada carrera solo puede estar asignada a un psicólogo; si ya está asignada a otro, se rechaza.
   */
  async setAssignments(psychologistId: string, careerIds: string[]): Promise<string[]> {
    const user = await prisma.user.findUnique({
      where: { id: psychologistId },
      select: { role: true, isActive: true },
    });
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }
    if (user.role !== ROLES.PSICOLOGO) {
      throw new AppError('Solo se pueden asignar carreras a usuarios con rol psicólogo', 400);
    }
    if (!user.isActive) {
      throw new AppError('No se pueden asignar carreras a un psicólogo inactivo', 400);
    }

    const uniqueIds = [...new Set(careerIds)];
    if (uniqueIds.length > 0) {
      const existingCareers = await prisma.career.findMany({
        where: { id: { in: uniqueIds }, isActive: true },
        select: { id: true },
      });
      const foundIds = new Set(existingCareers.map((c) => c.id));
      const missing = uniqueIds.filter((id) => !foundIds.has(id));
      if (missing.length > 0) {
        throw new AppError(`Carreras no encontradas o inactivas: ${missing.join(', ')}`, 400);
      }

      const currentAssignments = await prisma.psychologistCareer.findMany({
        where: { careerId: { in: uniqueIds } },
        select: { careerId: true, psychologistId: true },
      });
      const takenByOther = currentAssignments.find(
        (a) => a.psychologistId !== psychologistId
      );
      if (takenByOther) {
        const career = await prisma.career.findUnique({
          where: { id: takenByOther.careerId },
          select: { name: true },
        });
        throw new AppError(
          `La carrera "${career?.name ?? takenByOther.careerId}" ya está asignada a otro psicólogo. Cada carrera solo puede estar asignada a un psicólogo.`,
          400
        );
      }
    }

    await prisma.$transaction([
      prisma.psychologistCareer.deleteMany({ where: { psychologistId } }),
      ...uniqueIds.map((careerId) =>
        prisma.psychologistCareer.create({
          data: { psychologistId, careerId },
        })
      ),
    ]);

    return this.getAssignedCareerIds(psychologistId);
  }
}

export default new PsychologistCareerService();
