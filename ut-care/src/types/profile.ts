/** Profile as returned by GET /users/me */
export interface Profile {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isActive?: boolean
  phone?: string | null
  dateOfBirth?: string | null
  enrollmentNumber?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface UpdateProfileInput {
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: string
}
