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
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface UserStore extends User {
  fullName: string;
}
