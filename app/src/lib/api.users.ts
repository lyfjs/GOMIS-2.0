import { http } from './http'

export type UserDTO = {
  id: number
  email: string
  firstName: string
  lastName: string
  middleName?: string
  suffix?: string
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'
  position?: string
  workPosition?: string
  specialization?: string
  contactNo?: string
  role: 'ADMIN' | 'COUNSELOR' | 'TEACHER' | 'STAFF'
}

export async function authenticate(email: string, password: string) {
  return http.post<UserDTO>('/api/users/authenticate', { email, password })
}

export async function register(user: {
  email: string
  password: string
  firstName: string
  lastName: string
  middleName?: string
  suffix?: string
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'
  position?: string
  workPosition?: string
  specialization?: string
  contactNo?: string
}) {
  // Backend will set defaults like role and timestamps
  return http.post<UserDTO>('/api/users', user)
}

export async function meByEmail(email: string) {
  return http.get<UserDTO>(`/api/users/email/${encodeURIComponent(email)}`)
}

export async function updateUser(id: number, updates: Partial<UserDTO> & { password?: string }) {
  return http.put<UserDTO>(`/api/users/${id}`, updates)
}

export async function listUsers() {
  return http.get<UserDTO[]>(`/api/users`)
}


