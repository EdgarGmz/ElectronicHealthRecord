import { z } from 'zod';

export const createPrescriptionSchema = z.object({
  medicationId: z.string().uuid({ message: 'Medication is required.' }),
  dosage: z.string().min(1, { message: 'Dosage is required.' }),
  frequency: z.string().min(1, { message: 'Frequency is required.' }),
  route: z.string().min(1, { message: 'Route is required.' }),
  duration: z.string().optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date.' }),
  endDate: z.string().refine((val) => val === '' || !isNaN(Date.parse(val)), { message: 'Invalid end date.' }).optional().or(z.literal('')),
  instructions: z.string().optional(),
  status: z.enum(['active', 'inactive', 'discontinued']),
});

export type CreatePrescriptionFormInput = z.infer<typeof createPrescriptionSchema>;
