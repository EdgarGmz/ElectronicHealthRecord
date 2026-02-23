import prisma from '../config/database';

/**
 * Carreras asignadas al psicólogo. Solo puede atender estudiantes de esas carreras;
 * personal docente y administrativo puede ser atendido por cualquier psicólogo.
 */
export class PsychologistCareerService {
  async getAssignedCareerIds(psychologistId: string): Promise<string[]> {
    const assignments = await prisma.psychologistCareer.findMany({
      where: { psychologistId },
      select: { careerId: true },
    });
    return assignments.map((a) => a.careerId);
  }
}

export default new PsychologistCareerService();
