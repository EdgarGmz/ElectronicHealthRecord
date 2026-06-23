/** Profile as returned by GET /users/me */
export interface Profile {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  role: string
  isActive?: boolean
  phone?: string | null
  dateOfBirth?: string | null
  enrollmentNumber?: string | null
  lastUsernameChange?: string | null
  pendingEmail?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface UpdateProfileInput {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  username?: string
}
