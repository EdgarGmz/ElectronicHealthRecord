import { z } from 'zod';

export const updateNursingConsultationSchema = z.object({
  consultationDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date.' }).optional(),
  chiefComplaint: z.string().min(1, 'Chief complaint is required.').optional(),
  vitalSignsTemperature: z.coerce.number().optional(),
  vitalSignsBloodPressureSys: z.coerce.number().optional(),
  vitalSignsBloodPressureDia: z.coerce.number().optional(),
  vitalSignsHeartRate: z.coerce.number().optional(),
  vitalSignsRespiratoryRate: z.coerce.number().optional(),
  vitalSignsOxygenSaturation: z.coerce.number().optional(),
  vitalSignsWeight: z.coerce.number().optional(),
  vitalSignsHeight: z.coerce.number().optional(),
  physicalExamination: z.string().optional(),
  diagnosis: z.string().optional(),
  treatmentPlan: z.string().optional(),
  observations: z.string().optional(),
});

export type UpdateNursingConsultationInput = z.infer<typeof updateNursingConsultationSchema>;
