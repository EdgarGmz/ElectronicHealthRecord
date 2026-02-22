import { z } from 'zod';

// Schema for updating a patient's user and patient details.
// Most fields are optional as it's an update, not all fields may be changed.
export const updatePatientSchema = z.object({
  // User fields (some might be optional for update)
  email: z.string().email({ message: 'Invalid email address.' }).optional(),
  firstName: z.string().min(1, { message: 'First name is required.' }).optional(),
  lastName: z.string().min(1, { message: 'Last name is required.' }).optional(),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date.'}).optional(),
  enrollmentNumber: z.string().min(1, { message: 'Enrollment number is required.' }).optional(),
  phone: z.string().optional(),
  
  // Patient fields
  patientType: z.string().min(1, { message: 'Patient type is required.' }).optional(),
  maritalStatus: z.string().optional(),
  careerId: z.string().uuid({ message: 'A career must be selected.' }).optional(),
  group: z.string().optional(),
  occupation: z.string().optional(),
  trimester: z.preprocess((val) => (val === '' ? undefined : val), z.coerce.number().int().optional()),
});

export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
