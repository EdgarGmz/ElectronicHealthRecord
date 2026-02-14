export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'psychologist' | 'nurse' | 'student';
  isActive: boolean;
}

export interface Patient {
  id: string;
  userId: string;
  patientType: string;
  maritalStatus?: string;
  careerId: string;
  group?: string;
  occupation?: string;
  trimester?: number;
  user: User;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  bloodType?: string | null;
  allergies?: string | null;
  chronicConditions?: string | null;
  currentMedications?: string | null;
  familyHistory?: string | null;
  notes?: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  patient?: Patient;
  createdByUser?: User;
  updatedByUser?: User;
}

export interface MedicalRecordFormData {
  bloodType?: string;
  allergies?: string;
  chronicConditions?: string;
  currentMedications?: string;
  familyHistory?: string;
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
}
