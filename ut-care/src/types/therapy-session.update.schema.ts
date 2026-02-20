import { z } from 'zod';

export const updateTherapySessionSchema = z.object({
  sessionDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date.' }).optional(),
  mood: z.string().min(1, 'Mood is required.').optional(),
  evolutionNotes: z.string().min(1, 'Evolution notes are required.').optional(),
  patientProgress: z.string().min(1, 'Patient progress is required.').optional(),
  assignedTasks: z.string().optional(),
  observations: z.string().optional(),
  nextSessionPlan: z.string().optional(),
  sessionDuration: z.coerce.number().int().optional(),
});

export type UpdateTherapySessionInput = z.infer<typeof updateTherapySessionSchema>;
