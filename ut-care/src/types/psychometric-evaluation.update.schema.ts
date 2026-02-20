import { z } from 'zod';

export const updatePsychometricEvaluationSchema = z.object({
  evaluationType: z.string().min(1, 'Evaluation type is required.').optional(),
  applicationDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date.' }).optional(),
  rawScore: z.coerce.number().optional(),
  standardScore: z.coerce.number().optional(),
  percentile: z.coerce.number().int().min(0).max(100).optional(),
  interpretation: z.string().optional(),
  fileUrl: z.string().url('Invalid URL format.').optional().or(z.literal('')),
});

export type UpdatePsychometricEvaluationInput = z.infer<typeof updatePsychometricEvaluationSchema>;
