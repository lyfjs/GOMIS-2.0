import { http } from './http'

export type AppointmentDTO = {
  id: number
  date: string // yyyy-MM-dd
  time: string // HH:mm or HH:mm:ss
  title: string
  consultationType: string
  participantName: string
  participantLRN?: string
  participantType?: 'STUDENT' | 'PARENT' | 'GUARDIAN' | 'TEACHER' | 'OTHER'
  notes?: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
}

export function listAppointments() {
  return http.get<AppointmentDTO[]>('/api/appointments')
}

export function createAppointment(input: Omit<AppointmentDTO, 'id'>) {
  return http.post<AppointmentDTO>('/api/appointments', input)
}

export function updateAppointment(id: number, input: Partial<AppointmentDTO>) {
  return http.put<AppointmentDTO>(`/api/appointments/${id}`, input)
}

export function deleteAppointment(id: number) {
  return http.del(`/api/appointments/${id}`)
}



