import { z } from 'zod';

export const updateInterconsultationSchema = z.object({
  fromDepartment: z.string().min(1, 'From Department is required.').optional(),
  toDepartment: z.string().min(1, 'To Department is required.').optional(),
  toProfessionalId: z.string().uuid('Invalid Professional ID.').optional().or(z.literal('')),
  reason: z.string().min(1, 'Reason is required.').optional(),
  relevantInformation: z.string().optional(),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['pending', 'responded', 'cancelled']).optional(), // Status can be updated
  response: z.string().optional(), // Response can be added/updated
});

export type UpdateInterconsultationInput = z.infer<typeof updateInterconsultationSchema>;
