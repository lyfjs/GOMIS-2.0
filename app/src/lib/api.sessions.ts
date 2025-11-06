import { http } from './http'

export type SessionDTO = {
  id: number
  date: string
  time: string
  appointmentType?: string
  consultationType?: string
  status?: string
  notes?: string
  participants: any[]
  summary?: string
}

export function listSessions() {
  return http.get<SessionDTO[]>('/api/sessions')
}

export function createSession(input: Omit<SessionDTO, 'id'>) {
  return http.post<SessionDTO>('/api/sessions', input)
}

export function updateSession(id: number, input: Partial<SessionDTO>) {
  return http.put<SessionDTO>(`/api/sessions/${id}`, input)
}
