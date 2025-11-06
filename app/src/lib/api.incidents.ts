import { http } from './http'

export type IncidentDTO = {
  id: number
  reportedBy: string
  reportedByLRN?: string
  grade?: string
  section?: string
  date: string
  time: string
  status: string
  narrativeDate?: string
  narrativeTime?: string
  narrativeDescription?: string
  actionTaken?: string
  recommendation?: string
  participants: any[]
}

export function listIncidents() {
  return http.get<IncidentDTO[]>('/api/incidents')
}

export function createIncident(input: Omit<IncidentDTO, 'id'>) {
  return http.post<IncidentDTO>('/api/incidents', input)
}

export function updateIncident(id: number, input: Partial<IncidentDTO>) {
  return http.put<IncidentDTO>(`/api/incidents/${id}`, input)
}
