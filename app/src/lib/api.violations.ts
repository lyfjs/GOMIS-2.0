import { http } from './http'

export type ViolationDTO = {
  id: number
  studentId: number
  studentName: string
  studentLRN?: string
  violationType: string
  date: string // yyyy-MM-dd
  description?: string
  severity: 'Minor' | 'Major' | 'Severe'
  actionTaken?: string
  status: 'Pending' | 'Resolved' | 'Appealed'
}

export function listViolations(params?: { studentId?: number; severity?: string; status?: string; date?: string; q?: string }) {
  const qs = new URLSearchParams()
  if (params?.studentId != null) qs.set('studentId', String(params.studentId))
  if (params?.severity) qs.set('severity', params.severity)
  if (params?.status) qs.set('status', params.status)
  if (params?.date) qs.set('date', params.date)
  if (params?.q) qs.set('q', params.q)
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  return http.get<ViolationDTO[]>(`/api/violations${suffix}`)
}

export function listViolationsByStudent(studentId: number) {
  return http.get<ViolationDTO[]>(`/api/violations/student/${studentId}`)
}

export function createViolation(input: Omit<ViolationDTO, 'id'>) {
  return http.post<ViolationDTO>('/api/violations', input)
}

export function updateViolation(id: number, input: Partial<ViolationDTO>) {
  return http.put<ViolationDTO>(`/api/violations/${id}`, input)
}

export function deleteViolation(id: number) {
  return http.del(`/api/violations/${id}`)
}

export function listStudentsWithViolations(date?: string) {
  const suffix = date ? `?date=${encodeURIComponent(date)}` : ''
  return http.get<{ studentIds: number[] }>(`/api/violations/students${suffix}`)
}
