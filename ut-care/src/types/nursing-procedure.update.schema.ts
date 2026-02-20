import { z } from 'zod';

export const updateNursingProcedureSchema = z.object({
  procedureType: z.string().min(1, 'Procedure type is required.').optional(),
  procedureDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date.' }).optional(),
  description: z.string().min(1, 'Description is required.').optional(),
  materialsUsed: z.string().optional(),
  observations: z.string().optional(),
});

export type UpdateNursingProcedureInput = z.infer<typeof updateNursingProcedureSchema>;
