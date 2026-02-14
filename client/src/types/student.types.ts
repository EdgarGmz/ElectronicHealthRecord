export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone?: string;
  enrollmentNumber?: string;
  isActive: boolean;
}

export interface Career {
  id: string;
  name: string;
  code?: string;
  isActive: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  patientId: string;
}

export interface Student {
  id: string;
  userId: string;
  patientType: string;
  maritalStatus?: string;
  guardianName?: string;
  guardianPhone?: string;
  careerId: string;
  group?: string;
  occupation?: string;
  trimester?: number;
  createdAt: string;
  updatedAt: string;
  user: User;
  career: Career;
  emergencyContacts?: EmergencyContact[];
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  bloodType?: string;
  allergies?: string;
  chronicDiseases?: string;
  currentMedications?: string;
  observations?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  professionalId: string;
  appointmentType: string;
  scheduledDate: string;
  status: string;
  reason?: string;
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    patients: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
