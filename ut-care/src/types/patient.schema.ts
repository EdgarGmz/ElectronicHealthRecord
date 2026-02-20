import { z } from 'zod';

export const createPatientSchema = z.object({
  // User fields
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date.'}),
  enrollmentNumber: z.string().min(1, { message: 'Enrollment number is required.' }),
  phone: z.string().optional(),
  
  // Patient fields
  patientType: z.string().min(1, { message: 'Patient type is required.' }),
  maritalStatus: z.string().optional(),
  careerId: z.string().uuid({ message: 'A career must be selected.' }),
  group: z.string().optional(),
  occupation: z.string().optional(),
  trimester: z.coerce.number().int().optional(),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
