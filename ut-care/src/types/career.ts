export interface Career {
  id: string
  name: string
  code: string | null
  isActive?: boolean
  _count?: {
    patients: number
  }
}
