/**
 * React hooks for using the centralized data API
 * These hooks provide reactive state management for all data entities
 */

import { useState, useEffect, useCallback } from 'react'
import api, { Appointment, Session, Incident, Violation, User, Settings } from '../lib/api'
import {
  listStudents,
  getStudent as getStudentApi,
  createStudent as createStudentApi,
  updateStudent as updateStudentApi,
  deleteStudent as deleteStudentApi,
  searchStudentsByName,
  countByStatus,
  type StudentDTO,
} from '../lib/api.students'

// ===========================
// STUDENT HOOKS
// ===========================

export function useStudents() {
  const [students, setStudents] = useState<StudentDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [countsByStatus, setCountsByStatus] = useState<Record<string, number> | null>(null)

  const loadStudents = useCallback(async () => {
    setLoading(true)
    const data = await listStudents()
    setStudents(data)
    setLoading(false)
  }, [])

  const refreshCounts = useCallback(async () => {
    const statuses: StudentDTO['status'][] = ['ACTIVE', 'INACTIVE', 'DROPPED', 'GRADUATED']
    const entries = await Promise.all(statuses.map(async s => [s, await countByStatus(s)] as const))
    setCountsByStatus(Object.fromEntries(entries))
  }, [])

  useEffect(() => {
    loadStudents()
    refreshCounts()
  }, [loadStudents, refreshCounts])

  return {
    students,
    loading,
    countsByStatus,
    async createStudent(input: Omit<StudentDTO, 'id' | 'status'> & { status?: StudentDTO['status'] }) {
      const created = await createStudentApi(input)
      await Promise.all([loadStudents(), refreshCounts()])
      return created
    },
    async updateStudent(id: number, input: Partial<StudentDTO>) {
      const updated = await updateStudentApi(id, input)
      await Promise.all([loadStudents(), refreshCounts()])
      return updated
    },
    async deleteStudent(id: number) {
      await deleteStudentApi(id)
      await Promise.all([loadStudents(), refreshCounts()])
    },
    getStudentById: (id: number) => getStudentApi(id),
    searchStudents: (name: string) => searchStudentsByName(name),
    refresh: async () => {
      await Promise.all([loadStudents(), refreshCounts()])
    },
  }
}

export function useStudent(id: number | null) {
  const [student, setStudent] = useState<StudentDTO | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!id) {
        setStudent(null)
        setLoading(false)
        return
      }
      const data = await getStudentApi(id)
      if (!cancelled) {
        setStudent(data)
        setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [id])

  return { student, loading }
}

// ===========================
// APPOINTMENT HOOKS
// ===========================

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const loadAppointments = useCallback(() => {
    const data = api.getAllAppointments()
    setAppointments(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadAppointments()
    
    const handleUpdate = () => {
      loadAppointments()
    }
    
    api.on('appointments', handleUpdate)
    return () => api.off('appointments', handleUpdate)
  }, [loadAppointments])

  return {
    appointments,
    loading,
    createAppointment: api.createAppointment.bind(api),
    updateAppointment: api.updateAppointment.bind(api),
    deleteAppointment: api.deleteAppointment.bind(api),
    getAppointmentById: api.getAppointmentById.bind(api),
    getAppointmentsByDate: api.getAppointmentsByDate.bind(api),
    getAppointmentsByStudent: api.getAppointmentsByStudent.bind(api),
    refresh: loadAppointments,
  }
}

// ===========================
// SESSION HOOKS
// ===========================

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  const loadSessions = useCallback(() => {
    const data = api.getAllSessions()
    setSessions(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadSessions()
    
    const handleUpdate = () => {
      loadSessions()
    }
    
    api.on('sessions', handleUpdate)
    return () => api.off('sessions', handleUpdate)
  }, [loadSessions])

  return {
    sessions,
    loading,
    createSession: api.createSession.bind(api),
    updateSession: api.updateSession.bind(api),
    deleteSession: api.deleteSession.bind(api),
    getSessionById: api.getSessionById.bind(api),
    getSessionsByDate: api.getSessionsByDate.bind(api),
    getSessionsByParticipant: api.getSessionsByParticipant.bind(api),
    refresh: loadSessions,
  }
}

// ===========================
// INCIDENT HOOKS
// ===========================

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)

  const loadIncidents = useCallback(() => {
    const data = api.getAllIncidents()
    setIncidents(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadIncidents()
    
    const handleUpdate = () => {
      loadIncidents()
    }
    
    api.on('incidents', handleUpdate)
    return () => api.off('incidents', handleUpdate)
  }, [loadIncidents])

  return {
    incidents,
    loading,
    createIncident: api.createIncident.bind(api),
    updateIncident: api.updateIncident.bind(api),
    deleteIncident: api.deleteIncident.bind(api),
    getIncidentById: api.getIncidentById.bind(api),
    getIncidentsByDate: api.getIncidentsByDate.bind(api),
    getIncidentsByStudent: api.getIncidentsByStudent.bind(api),
    refresh: loadIncidents,
  }
}

// ===========================
// VIOLATION HOOKS
// ===========================

export function useViolations() {
  const [violations, setViolations] = useState<Violation[]>([])
  const [loading, setLoading] = useState(true)

  const loadViolations = useCallback(() => {
    const data = api.getAllViolations()
    setViolations(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadViolations()
    
    const handleUpdate = () => {
      loadViolations()
    }
    
    api.on('violations', handleUpdate)
    return () => api.off('violations', handleUpdate)
  }, [loadViolations])

  return {
    violations,
    loading,
    createViolation: api.createViolation.bind(api),
    updateViolation: api.updateViolation.bind(api),
    deleteViolation: api.deleteViolation.bind(api),
    getViolationById: api.getViolationById.bind(api),
    getViolationsByStudent: api.getViolationsByStudent.bind(api),
    refresh: loadViolations,
  }
}

// ===========================
// USER HOOKS
// ===========================

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const data = api.getCurrentUser()
    setUser(data)
    setLoading(false)

    const handleUpdate = (updatedUser: User | null) => {
      setUser(updatedUser)
    }

    api.on('user', handleUpdate)
    return () => api.off('user', handleUpdate)
  }, [])

  return {
    user,
    loading,
    updateUser: (updates: Partial<User>) => {
      if (user) {
        return api.updateUser(user.id, updates)
      }
      return null
    },
    logout: api.logoutUser.bind(api),
  }
}

// ===========================
// SETTINGS HOOKS
// ===========================

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  const loadSettings = useCallback(() => {
    const data = api.getSettings()
    setSettings(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadSettings()

    const handleUpdate = (updatedSettings: Settings) => {
      setSettings(updatedSettings)
    }

    api.on('settings', handleUpdate)
    return () => api.off('settings', handleUpdate)
  }, [loadSettings])

  return {
    settings,
    loading,
    updateSettings: api.updateSettings.bind(api),
    refresh: loadSettings,
  }
}

// ===========================
// CALENDAR HOOKS
// ===========================

export function useCalendarEvents(year: number, month: number) {
  const [events, setEvents] = useState<Map<string, {
    appointments: Appointment[]
    sessions: Session[]
    incidents: Incident[]
  }>>(new Map())
  const [loading, setLoading] = useState(true)

  const loadEvents = useCallback(() => {
    const data = api.getAllEventsForMonth(year, month)
    setEvents(data)
    setLoading(false)
  }, [year, month])

  useEffect(() => {
    loadEvents()

    // Listen to all event types
    api.on('appointments', loadEvents)
    api.on('sessions', loadEvents)
    api.on('incidents', loadEvents)

    return () => {
      api.off('appointments', loadEvents)
      api.off('sessions', loadEvents)
      api.off('incidents', loadEvents)
    }
  }, [loadEvents])

  return {
    events,
    loading,
    refresh: loadEvents,
  }
}

// ===========================
// STATISTICS HOOKS
// ===========================

export function useStatistics() {
  const [stats, setStats] = useState<ReturnType<typeof api.getStatistics> | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStats = useCallback(() => {
    const data = api.getStatistics()
    setStats(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadStats()

    // Refresh stats when any data changes
    api.on('students', loadStats)
    api.on('appointments', loadStats)
    api.on('sessions', loadStats)
    api.on('incidents', loadStats)

    return () => {
      api.off('students', loadStats)
      api.off('appointments', loadStats)
      api.off('sessions', loadStats)
      api.off('incidents', loadStats)
    }
  }, [loadStats])

  return {
    stats,
    loading,
    refresh: loadStats,
  }
}
