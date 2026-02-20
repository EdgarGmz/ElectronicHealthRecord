export interface User {
  id: string;
  enrollmentNumber?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'psychologist' | 'nurse' | 'receptionist' | 'patient';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface UserStore extends User {
  fullName: string;
}
