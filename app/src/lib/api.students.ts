import { http } from './http'

export type StudentDTO = {
  id: number
  lrn: string
  firstName: string
  lastName: string
  middleName?: string
  gradeLevel: string
  section: string
  trackStrand: string
  specialization?: string
  schoolYear?: string
  status: 'ACTIVE' | 'INACTIVE' | 'DROPPED' | 'GRADUATED'
}

export function listStudents() {
  return http.get<StudentDTO[]>('/api/students')
}

export function getStudent(id: number) {
  return http.get<StudentDTO>(`/api/students/${id}`)
}

export function createStudent(input: Omit<StudentDTO, 'id' | 'status'> & { status?: StudentDTO['status'] }) {
  return http.post<StudentDTO>('/api/students', input)
}

export function updateStudent(id: number, input: Partial<StudentDTO>) {
  return http.put<StudentDTO>(`/api/students/${id}`, input)
}

export function deleteStudent(id: number) {
  return http.del(`/api/students/${id}`)
}

export function searchStudentsByName(name: string) {
  return http.get<StudentDTO[]>(`/api/students/search/name?name=${encodeURIComponent(name)}`)
}

export function countByStatus(status: StudentDTO['status']) {
  return http.get<number>(`/api/students/count/status/${status}`)
}

export function getStudentsMeta() {
  return http.get<{ gradeLevels: string[]; sections: string[]; trackStrands: string[] }>(`/api/students/meta`)
}


