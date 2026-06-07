export interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  dateOfBirth: string
  phone: string | null
  role: string
  isActive: boolean
  enrollmentNumber: string | null
  createdAt?: string
  updatedAt?: string
}

export interface UsersResponse {
  users: User[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export interface CreateUserInput {
  email: string
  password: string
  firstName: string
  lastName: string
  dateOfBirth?: string
  phone?: string
  role: string
  enrollmentNumber?: string
}

export interface UpdateUserInput {
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  phone?: string
  role?: string
  isActive?: boolean
}

