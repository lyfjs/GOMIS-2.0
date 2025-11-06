import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Button } from './ui/button'
import { AddAppointmentDialog } from './add-appointment-dialog'
import { EditAppointmentDialog } from './edit-appointment-dialog'
import { CreateStudentDialog } from './create-student-dialog'
import { EditStudentDialog } from './edit-student-dialog'
import { SessionFillupForm } from './session-fillup-form'
import { IncidentFillupForm } from './incident-fillup-form'
import { CalendarView } from './calendar-view'
import { 
  Calendar,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ClipboardList,
  Plus
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import { listStudents, StudentDTO, getStudentsMeta, createStudent } from '../lib/api.students'
import { listAppointments, AppointmentDTO } from '../lib/api.appointments'
import { listViolationsByStudent, ViolationDTO, listStudentsWithViolations } from '../lib/api.violations'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { listIncidents, IncidentDTO, updateIncident } from '../lib/api.incidents'
import { listSessions, SessionDTO, updateSession } from '../lib/api.sessions'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { on, emit } from '../lib/events'

interface DashboardContentProps {
  activeSection: string
}

function getStudentDisplayName(s: any) {
  const first = s.firstName || s.first_name || ''
  const middle = s.middleName || s.middle_name || ''
  const last = s.lastName || s.last_name || ''
  return [first, middle, last].filter(Boolean).join(' ').trim() || 'Unnamed Student'
}

function getStudentInitials(s: any) {
  const name = getStudentDisplayName(s)
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || 'ST'
}

export function DashboardContent({ activeSection }: DashboardContentProps) {
  const [appointments, setAppointments] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [incidents, setIncidents] = useState<any[]>([])
  const [violations, setViolations] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [editAppointmentOpen, setEditAppointmentOpen] = useState(false)
  const [violationFilters, setViolationFilters] = useState({ name: '', gradeLevel: '', section: '', trackStrand: '' })
  const [selectedViolationStudent, setSelectedViolationStudent] = useState<any>(null)
  const [violationsForStudent, setViolationsForStudent] = useState<ViolationDTO[] | null>(null)
  const [violationsDialogOpen, setViolationsDialogOpen] = useState(false)
  const [studentMeta, setStudentMeta] = useState<{ gradeLevels: string[]; sections: string[]; trackStrands: string[] }>({ gradeLevels: [], sections: [], trackStrands: [] })
  const [onlyWithViolations, setOnlyWithViolations] = useState(false)
  const [violationDateFilter, setViolationDateFilter] = useState('')
  const [studentsWithViolations, setStudentsWithViolations] = useState<number[] | null>(null)

  // Load data from backend on component mount
  useEffect(() => {
    ;(async () => {
      try {
        const [studentsRes, appointmentsRes, meta, incidentsRes, sessionsRes] = await Promise.all([
          listStudents(),
          listAppointments(),
          getStudentsMeta(),
          listIncidents(),
          listSessions(),
        ])
        setStudents(studentsRes as unknown as StudentDTO[])
        setAppointments(appointmentsRes as unknown as AppointmentDTO[])
        setStudentMeta(meta)
        setIncidents(incidentsRes as unknown as IncidentDTO[])
        setSessions(sessionsRes as unknown as SessionDTO[])
      } catch (e) {
        // Surface minimal error; avoid noise on empty backends
      }
    })()
  }, [])

  // Refetch students-with-violations when toggled or date changes
  React.useEffect(() => {
    ;(async () => {
      if (!onlyWithViolations) {
        setStudentsWithViolations(null)
        return
      }
      try {
        const res = await listStudentsWithViolations(violationDateFilter || undefined)
        setStudentsWithViolations(res.studentIds)
      } catch {
        setStudentsWithViolations([])
      }
    })()
  }, [onlyWithViolations, violationDateFilter])

  // Listen to global data events and refetch respective lists to sync across views
  useEffect(() => {
    const unsubInc = on('data:incidents', async () => {
      try { setIncidents(await listIncidents() as any) } catch {}
    })
    const unsubSess = on('data:sessions', async () => {
      try { setSessions(await listSessions() as any) } catch {}
    })
    const unsubStud = on('data:students', async () => {
      try { setStudents(await listStudents() as any) } catch {}
    })
    const unsubApt = on('data:appointments', async () => {
      try { setAppointments(await listAppointments() as any) } catch {}
    })
    const unsubAny = on('data:any', async () => {
      try {
        const [a,b,c,d] = await Promise.all([listStudents(), listAppointments(), listIncidents(), listSessions()])
        setStudents(a as any); setAppointments(b as any); setIncidents(c as any); setSessions(d as any)
      } catch {}
    })
    return () => { unsubInc(); unsubSess(); unsubStud(); unsubApt(); unsubAny() }
  }, [])

  const handleAppointmentAdd = (newAppointment: any) => {
    setAppointments(prev => [...prev, newAppointment])
  }

  const handleStudentAdd = (newStudent: any) => {
    setStudents(prev => [...prev, newStudent])
    toast.success('Student created successfully!')
  }

  const handleStudentUpdate = (updatedStudent: any) => {
    setStudents(prev => prev.map(s => 
      (s.id === updatedStudent.id || s.lrn === updatedStudent.lrn) ? updatedStudent : s
    ))
    toast.success('Student updated successfully!')
  }

  const handleStudentDelete = (studentToDelete: any) => {
    setStudents(prev => prev.filter(s => s.id !== studentToDelete.id && s.lrn !== studentToDelete.lrn))
    toast.success('Student deleted successfully!')
  }

  const handleViewDetails = (student: any) => {
    setSelectedStudent(student)
    setEditDialogOpen(true)
  }

  const handleSessionAdd = (newSession: any) => {
    setSessions(prev => [...prev, newSession])
    toast.success('Session created successfully!')
  }

  const handleIncidentAdd = (newIncident: any) => {
    setIncidents(prev => [...prev, newIncident])
    toast.success('Incident report created successfully!')
  }

  const handleAppointmentUpdate = (updatedAppointment: any) => {
    setAppointments(prev => prev.map(apt => 
      apt.id === updatedAppointment.id ? updatedAppointment : apt
    ))
    toast.success('Appointment updated successfully!')
  }

  const handleAppointmentCancel = (appointmentId: any) => {
    setAppointments(prev => prev.map(apt =>
      apt.id === appointmentId ? { ...apt, status: 'Cancelled' } : apt
    ))
    toast.success('Appointment cancelled')
  }

  const handleViewAppointment = (appointment: any) => {
    setSelectedAppointment(appointment)
    setEditAppointmentOpen(true)
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]
  const renderDashboardOverview = () => {
    const todaysAppointments = appointments.filter(apt => apt.date === today)
    const completedToday = todaysAppointments.filter(apt => apt.status === 'Completed').length
    const scheduledToday = todaysAppointments.filter(apt => apt.status === 'Scheduled').length
    const completionRate = appointments.length > 0 ? 
      Math.round((appointments.filter(apt => apt.status === 'Completed').length / appointments.length) * 100) : 0
    
    // Calculate session statistics
    const todaysSessions = sessions.filter(session => session.date === today)
    const completedSessions = sessions.filter(session => session.status === 'Completed').length
    
    // Calculate incident statistics
    const openIncidents = incidents.filter(incident => 
      incident.status !== 'Resolved' && incident.status !== 'Dismissed'
    ).length
    const todaysIncidents = incidents.filter(incident => incident.date === today)
    
    // Calculate student statistics
    const grade11Students = students.filter((s: any) => (s.gradeLevel || s.grade) === '11').length
    const grade12Students = students.filter((s: any) => (s.gradeLevel || s.grade) === '12').length
    
    return (
      <div className="space-y-6">
        <div className="animate-slide-in-top">
          <h1>Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome to the Guidance Office Management System</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-stagger">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">
                Grade 11: {grade11Students} • Grade 12: {grade12Students}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Sessions</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessions.length}</div>
              <p className="text-xs text-muted-foreground">
                {todaysSessions.length} scheduled today • {completedSessions} completed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Incidents</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openIncidents}</div>
              <p className="text-xs text-muted-foreground">
                Open cases • {incidents.length} total incidents
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Appointments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments.length}</div>
              <p className="text-xs text-muted-foreground">
                {scheduledToday} today • {completionRate}% completion
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest appointments and sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {appointments.length > 0 ? (
                appointments
                  .sort((a, b) => {
                    const dateA = new Date(`${a.date} ${a.time}`)
                    const dateB = new Date(`${b.date} ${b.time}`)
                    return dateB.getTime() - dateA.getTime()
                  })
                  .slice(0, 5)
                  .map((appointment) => (
                    <div key={appointment.id} className="flex items-center space-x-4">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {appointment.participantName.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{appointment.participantName}</p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.consultationType} • {appointment.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{appointment.time}</p>
                        <Badge variant={
                          appointment.status === 'Completed' ? 'default' : 
                          appointment.status === 'Cancelled' ? 'destructive' : 
                          'secondary'
                        }>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No appointments scheduled yet</p>
                  <p className="text-xs text-muted-foreground">Start by creating a new appointment</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Events scheduled for {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Appointments</span>
                  </div>
                  <span className="text-sm font-medium">{scheduledToday}</span>
                </div>
                <Progress value={scheduledToday * 20} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Sessions</span>
                  </div>
                  <span className="text-sm font-medium">{todaysSessions.length}</span>
                </div>
                <Progress value={todaysSessions.length * 20} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Incidents</span>
                  </div>
                  <span className="text-sm font-medium">{todaysIncidents.length}</span>
                </div>
                <Progress value={todaysIncidents.length * 20} className="h-2" />
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span>Total Events Today</span>
                  <span className="font-medium">{scheduledToday + todaysSessions.length + todaysIncidents.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>System statistics at a glance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Records</span>
                <span className="font-medium">{appointments.length + students.length + sessions.length + incidents.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Cases</span>
                <span className="font-medium">{openIncidents}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Completed Sessions</span>
                <span className="font-medium">{completedSessions}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Incidents</CardTitle>
              <CardDescription>Latest incident reports</CardDescription>
            </CardHeader>
            <CardContent>
              {incidents.length > 0 ? (
                <div className="space-y-2">
                  {incidents.slice(-3).reverse().map((incident) => (
                    <div key={incident.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">{incident.reportedBy}</p>
                        <p className="text-xs text-muted-foreground">{incident.date}</p>
                      </div>
                      <Badge variant={
                        incident.status === 'Resolved' ? 'default' : 
                        incident.status === 'Dismissed' ? 'outline' : 
                        'secondary'
                      } className="ml-2">
                        {incident.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No incidents reported</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>Scheduled counseling sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length > 0 ? (
                <div className="space-y-2">
                  {sessions
                    .filter(session => new Date(session.date) >= new Date(today))
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 3)
                    .map((session, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{session.sessionType}</p>
                          <p className="text-xs text-muted-foreground">
                            {session.date} at {session.timeStart}
                          </p>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {session.status || 'Scheduled'}
                        </Badge>
                      </div>
                    ))}
                  {sessions.filter(session => new Date(session.date) >= new Date(today)).length === 0 && (
                    <p className="text-sm text-muted-foreground">No upcoming sessions</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No sessions scheduled</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderAppointments = () => {
    // Handle Calendar View
    if (activeSection === 'appointments-calendar') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center animate-slide-in-top">
            <div>
              <h1>Calendar View</h1>
              <p className="text-muted-foreground">View all appointments, sessions, and incidents on calendar</p>
            </div>
            <AddAppointmentDialog onAppointmentAdd={handleAppointmentAdd} />
          </div>
          <CalendarView 
            appointments={appointments} 
            sessions={sessions} 
            incidents={incidents}
          />
        </div>
      )
    }

    // Handle Schedule View
    if (activeSection === 'appointments-schedule') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center animate-slide-in-top">
            <div>
              <h1>Schedule</h1>
              <p className="text-muted-foreground">View and manage all scheduled appointments</p>
            </div>
            <AddAppointmentDialog onAppointmentAdd={handleAppointmentAdd} />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>All Appointments</CardTitle>
              <CardDescription>View, edit, or cancel appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <div className="space-y-2">
                  {appointments
                    .sort((a, b) => {
                      const dateA = new Date(`${a.date} ${a.time}`)
                      const dateB = new Date(`${b.date} ${b.time}`)
                      return dateA.getTime() - dateB.getTime()
                    })
                    .map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 rounded-md border hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium">{appointment.title}</p>
                            <Badge variant={
                              appointment.status === 'Completed' ? 'default' : 
                              appointment.status === 'Scheduled' ? 'secondary' : 
                              'destructive'
                            }>
                              {appointment.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {appointment.date} at {appointment.time}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {appointment.participantName} • {appointment.consultationType}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewAppointment(appointment)}
                        >
                          Edit
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">No appointments scheduled</p>
                  <p className="text-xs text-muted-foreground mb-4">Start by creating a new appointment</p>
                  <AddAppointmentDialog onAppointmentAdd={handleAppointmentAdd} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Appointment Dialog */}
          {selectedAppointment && (
            <EditAppointmentDialog
              appointment={selectedAppointment}
              open={editAppointmentOpen}
              onOpenChange={setEditAppointmentOpen}
              onAppointmentUpdate={handleAppointmentUpdate}
              onAppointmentCancel={handleAppointmentCancel}
            />
          )}
        </div>
      )
    }

    // Default Appointments overview
    const todaysAppointments = appointments.filter(apt => apt.date === today)
    const completedCount = appointments.filter(apt => apt.status === 'Completed').length
    const scheduledCount = appointments.filter(apt => apt.status === 'Scheduled').length

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center animate-slide-in-top">
          <div>
            <h1>Appointments</h1>
            <p className="text-muted-foreground">Manage student appointments and sessions</p>
          </div>
          <AddAppointmentDialog onAppointmentAdd={handleAppointmentAdd} />
        </div>
        
        <div className="grid gap-4 md:grid-cols-3 animate-stagger">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar View
              </CardTitle>
              <CardDescription>See all events on calendar</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View appointments, sessions, and incidents on a unified calendar with color-coded markers.
              </p>
              <Button variant="outline" className="w-full">
                View Calendar
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Schedule
              </CardTitle>
              <CardDescription>Manage appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View and edit all scheduled appointments. Update times, details, or cancel appointments.
              </p>
              <Button variant="outline" className="w-full">
                View Schedule
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appointment Status</CardTitle>
              <CardDescription>Current statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Completed</span>
                  </div>
                  <span className="text-sm font-medium">{completedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Scheduled</span>
                  </div>
                  <span className="text-sm font-medium">{scheduledCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
            <CardDescription>Scheduled for {today}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaysAppointments.length > 0 ? (
                todaysAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 rounded-md border">
                    <div>
                      <p className="text-sm font-medium">{appointment.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.time} • {appointment.participantName}
                      </p>
                    </div>
                    <Badge variant={appointment.status === 'Completed' ? 'default' : 'secondary'}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No appointments scheduled for today</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderStudents = () => {
    // Handle specific student sub-sections
    if (activeSection === 'students-create-student') {
      return (
        <div className="space-y-6">
          <div className="animate-slide-in-top">
            <h1>Create Student</h1>
            <p className="text-muted-foreground">Add new students to the system</p>
          </div>
          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Student Registration</CardTitle>
                <CardDescription>Complete the form below to register a new student</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Fill in all required student information including personal details, address, family contacts, and school form data.
                  </p>
                  <CreateStudentDialog onStudentAdd={handleStudentAdd} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    if (activeSection === 'students-import-school-form') {
      return null
    }

    if (activeSection === 'students-student-data') {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center animate-slide-in-top">
            <div>
              <h1>Student Data</h1>
              <p className="text-muted-foreground">View and manage all student records</p>
            </div>
            <CreateStudentDialog onStudentAdd={handleStudentAdd} />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students</CardTitle>
              <CardDescription>Complete list of all registered students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {students.length > 0 ? (
                  students.map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-md border">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {getStudentInitials(student)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{getStudentDisplayName(student)}</p>
                          <p className="text-xs text-muted-foreground">
                            LRN: {student.lrn} • Grade {student.gradeLevel || student.grade || ''} • Section: {student.section || ''}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(student.gender || '').toString()} • {(student.trackStrand || '')}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(student)}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">No students enrolled yet</p>
                    <p className="text-xs text-muted-foreground mb-4">Start by creating a new student record</p>
                    <CreateStudentDialog onStudentAdd={handleStudentAdd} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edit Student Dialog */}
          {selectedStudent && (
            <EditStudentDialog
              student={selectedStudent}
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              onStudentUpdate={handleStudentUpdate}
              onStudentDelete={() => handleStudentDelete(selectedStudent)}
            />
          )}
        </div>
      )
    }

    // Default Student Management overview
    return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Student Management</h1>
          <p className="text-muted-foreground">Manage student records and enrollment</p>
        </div>
        <CreateStudentDialog onStudentAdd={handleStudentAdd} />
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Create Student
            </CardTitle>
            <CardDescription>Add new students to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Register new students with complete information including personal details, address, family contacts, and school form data.
              </p>
              <CreateStudentDialog onStudentAdd={handleStudentAdd} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Import Students (CSV/Excel)
            </CardTitle>
            <CardDescription>Bulk import from spreadsheet files</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Upload a CSV file with headers: lrn, firstName, middleName, lastName, gradeLevel, section, trackStrand, schoolYear, status.
              </p>
              <div>
                <input
                  id="student-import-input"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const ext = file.name.toLowerCase().split('.').pop()
                    if (ext === 'csv') {
                      const text = await file.text()
                      const lines = text.split(/\r?\n/).filter(Boolean)
                      if (!lines.length) return
                      const headers = lines[0].split(',').map(h => h.trim())
                      const idx = (name: string) => headers.findIndex(h => h.toLowerCase() === name.toLowerCase())
                      const newStudents: any[] = []
                      for (let i = 1; i < lines.length; i++) {
                        const cols = lines[i].split(',')
                        if (!cols.length) continue
                        const payload: any = {
                          lrn: cols[idx('lrn')]?.trim(),
                          firstName: cols[idx('firstName')]?.trim(),
                          middleName: cols[idx('middleName')]?.trim() || undefined,
                          lastName: cols[idx('lastName')]?.trim(),
                          gradeLevel: cols[idx('gradeLevel')]?.trim(),
                          section: cols[idx('section')]?.trim(),
                          trackStrand: cols[idx('trackStrand')]?.trim(),
                          schoolYear: cols[idx('schoolYear')]?.trim() || undefined,
                          status: (cols[idx('status')]?.trim() as any) || 'ACTIVE',
                        }
                        if (payload.lrn && payload.firstName && payload.lastName && payload.gradeLevel && payload.section && payload.trackStrand) {
                          try {
                            const created = await createStudent(payload)
                            newStudents.push(created)
                          } catch {}
                        }
                      }
                      if (newStudents.length) {
                        setStudents(prev => [...prev, ...newStudents])
                        toast.success(`Imported ${newStudents.length} students`)
                      } else {
                        toast.error('No valid rows imported')
                      }
                    } else {
                      toast.error('Excel import not available. Please upload CSV.')
                    }
                    e.currentTarget.value = ''
                  }}
                />
                <Button variant="outline" className="w-full" onClick={() => document.getElementById('student-import-input')?.click()}>
                  Import CSV/Excel
                </Button>
                <div className="text-xs text-muted-foreground mt-1">
                  Download sample: <a href="/src/templates/samples/students_sample.csv" className="underline">students_sample.csv</a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Student Statistics
            </CardTitle>
            <CardDescription>Overview of student data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Students</span>
                <span className="text-sm font-medium">{students.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Grade 11</span>
                <span className="text-sm font-medium">
                  {students.filter(s => s.gradeLevel === '11').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Grade 12</span>
                <span className="text-sm font-medium">
                  {students.filter(s => s.gradeLevel === '12').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Enrolled Students</span>
                <span className="text-sm font-medium">
                  {students.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Data</CardTitle>
          <CardDescription>Complete list of enrolled students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {students.length > 0 ? (
              students.map((student, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-md border">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {getStudentInitials(student)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{getStudentDisplayName(student)}</p>
                      <p className="text-xs text-muted-foreground">
                        LRN: {student.lrn} • Grade {student.gradeLevel || student.grade || ''} • Section: {student.section || ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(student.gender || '').toString()} • {(student.trackStrand || '')}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(student)}>
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">No students enrolled yet</p>
                <p className="text-xs text-muted-foreground mb-4">Start by creating a new student record</p>
                <CreateStudentDialog onStudentAdd={handleStudentAdd} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      {selectedStudent && (
        <EditStudentDialog
          student={selectedStudent}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onStudentUpdate={handleStudentUpdate}
          onStudentDelete={() => handleStudentDelete(selectedStudent)}
        />
      )}
    </div>
  )
  }

  const renderIncidents = () => {
    if (activeSection === 'incidents-incident-fillup') {
      return (
        <div className="space-y-6">
          <div className="animate-slide-in-top">
            <h1>Incident Fill-Up Form</h1>
            <p className="text-muted-foreground">Report and document student incidents</p>
          </div>
          <IncidentFillupForm students={students} onIncidentAdd={handleIncidentAdd} />
        </div>
      )
    }

    if (activeSection === 'incidents-incident-records') {
      const [editingIncident, setEditingIncident] = React.useState<any | null>(null)
      const [editOpen, setEditOpen] = React.useState(false)
      const [editForm, setEditForm] = React.useState<any>({})

      const openEdit = (inc: any) => {
        setEditingIncident(inc)
        setEditForm({
          status: inc.status || 'Pending',
          narrativeDescription: inc.narrativeDescription || '',
          actionTaken: inc.actionTaken || '',
          recommendation: inc.recommendation || '',
        })
        setEditOpen(true)
      }

      const saveEdit = async () => {
        if (!editingIncident) return
        try {
          const updated = await updateIncident(Number(editingIncident.id), {
            status: editForm.status,
            narrativeDescription: editForm.narrativeDescription,
            actionTaken: editForm.actionTaken,
            recommendation: editForm.recommendation,
          })
          setIncidents(prev => prev.map(i => (i.id === updated.id ? updated : i)))
          setEditOpen(false)
          toast.success('Incident updated')
          emit('data:violations')
        } catch {
          setIncidents(prev => prev.map(i => (i.id === editingIncident.id ? { ...i, ...editForm } : i)))
          setEditOpen(false)
          toast.success('Incident updated (local)')
          emit('data:violations')
        }
      }

      return (
        <div className="space-y-6">
          <div className="animate-slide-in-top">
            <h1>Incident Records</h1>
            <p className="text-muted-foreground">View and manage all reported incidents</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Incident Reports</CardTitle>
              <CardDescription>Click view to inspect or edit details</CardDescription>
            </CardHeader>
            <CardContent>
              {incidents.length > 0 ? (
                <div className="space-y-2">
                  {incidents.map((incident) => (
                    <div key={incident.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <div className="text-sm font-medium">{incident.reportedBy}</div>
                        <div className="text-xs text-muted-foreground">LRN: {incident.reportedByLRN || 'N/A'}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          incident.status === 'Resolved' ? 'default' : 
                          incident.status === 'Ongoing Investigation' ? 'secondary' : 
                          incident.status === 'Dismissed' ? 'outline' : 'secondary'
                        }>
                          {incident.status}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => openEdit(incident)}>View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No incidents reported</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Incident Details</DialogTitle>
                <DialogDescription>Edit status or notes for this incident</DialogDescription>
              </DialogHeader>
              {editingIncident && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Student</Label>
                      <div className="text-sm bg-muted rounded px-3 py-2">{editingIncident.reportedBy}</div>
                    </div>
                    <div>
                      <Label>LRN</Label>
                      <div className="text-sm bg-muted rounded px-3 py-2">{editingIncident.reportedByLRN || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Date</Label>
                      <div className="text-sm bg-muted rounded px-3 py-2">{editingIncident.date}</div>
                    </div>
                    <div>
                      <Label>Time</Label>
                      <div className="text-sm bg-muted rounded px-3 py-2">{editingIncident.time}</div>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select value={editForm.status} onValueChange={(v) => setEditForm((f:any) => ({ ...f, status: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Ongoing Investigation">Ongoing Investigation</SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                          <SelectItem value="Dismissed">Dismissed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Narrative</Label>
                    <Textarea rows={4} value={editForm.narrativeDescription} onChange={(e) => setEditForm((f:any) => ({ ...f, narrativeDescription: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Action Taken</Label>
                    <Textarea rows={3} value={editForm.actionTaken} onChange={(e) => setEditForm((f:any) => ({ ...f, actionTaken: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Recommendation</Label>
                    <Textarea rows={3} value={editForm.recommendation} onChange={(e) => setEditForm((f:any) => ({ ...f, recommendation: e.target.value }))} />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setEditOpen(false)}>Close</Button>
                    <Button onClick={saveEdit}>Save</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )
    }

    // default incident management
    return (
      <div className="space-y-6">
        <div className="animate-slide-in-top">
          <h1>Incident Management</h1>
          <p className="text-muted-foreground">Track and manage student incidents</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 animate-stagger">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Incident Fill-Up Form
              </CardTitle>
              <CardDescription>Report new incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Document and report new student incidents with detailed information including participants, narrative, and actions taken.
              </p>
              <Button variant="outline" className="w-full" onClick={() => window.location.hash = 'incidents-incident-fillup'}>
                Create Incident Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Incident Records
              </CardTitle>
              <CardDescription>View all incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Access complete records of all reported incidents including status, participants, and resolutions.
              </p>
              <Button variant="outline" className="w-full" onClick={() => window.location.hash = 'incidents-incident-records'}>
                View Records
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>Latest reported incidents requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {incidents.length > 0 ? (
              <div className="space-y-3">
                {incidents.slice(-5).reverse().map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between p-4 rounded-md border">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{incident.id}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Reported by: {incident.reportedBy} • {incident.date} at {incident.time}
                      </p>
                    </div>
                    <Badge variant={
                      incident.status === 'Resolved' ? 'default' : 
                      incident.status === 'Ongoing Investigation' ? 'secondary' : 
                      incident.status === 'Dismissed' ? 'outline' : 'secondary'
                    }>
                      {incident.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">No incidents reported yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderSessions = () => {
    if (activeSection === 'sessions-session-records') {
      const [editing, setEditing] = React.useState<any | null>(null)
      const [open, setOpen] = React.useState(false)
      const [form, setForm] = React.useState<any>({})

      const openEdit = (s: any) => {
        setEditing(s)
        setForm({
          status: s.status || '',
          notes: s.notes || '',
          summary: s.summary || '',
        })
        setOpen(true)
      }

      const save = async () => {
        if (!editing) return
        try {
          const updated = await updateSession(Number(editing.id), {
            status: form.status,
            notes: form.notes,
            summary: form.summary,
          })
          setSessions(prev => prev.map(x => (x.id === updated.id ? updated : x)))
          setOpen(false)
          toast.success('Session updated')
          emit('data:violations')
        } catch {
          setSessions(prev => prev.map(x => (x.id === editing.id ? { ...x, ...form } : x)))
          setOpen(false)
          toast.success('Session updated (local)')
          emit('data:violations')
        }
      }

      return (
        <div className="space-y-6">
          <div className="animate-slide-in-top">
            <h1>Session Records</h1>
            <p className="text-muted-foreground">View and manage session logs</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Sessions</CardTitle>
              <CardDescription>Click view to inspect or edit</CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length ? (
                <div className="space-y-2">
                  {sessions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <div className="text-sm font-medium">{s.consultationType || 'Session'}</div>
                        <div className="text-xs text-muted-foreground">{s.date} • {s.time}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={s.status === 'Ended' ? 'default' : 'secondary'}>{s.status || 'Active'}</Badge>
                        <Button size="sm" variant="outline" onClick={() => openEdit(s)}>View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">No sessions recorded</div>
              )}
            </CardContent>
          </Card>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Session Details</DialogTitle>
                <DialogDescription>Edit status or notes for this session</DialogDescription>
              </DialogHeader>
              {editing && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Date</Label>
                      <div className="text-sm bg-muted rounded px-3 py-2">{editing.date}</div>
                    </div>
                    <div>
                      <Label>Time</Label>
                      <div className="text-sm bg-muted rounded px-3 py-2">{editing.time}</div>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select value={form.status} onValueChange={(v) => setForm((f:any) => ({ ...f, status: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Ended">Ended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea rows={3} value={form.notes} onChange={(e) => setForm((f:any) => ({ ...f, notes: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Summary</Label>
                    <Textarea rows={4} value={form.summary} onChange={(e) => setForm((f:any) => ({ ...f, summary: e.target.value }))} />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
                    <Button onClick={save}>Save</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )
    }
    return null
  }

  const renderViolations = () => {
    if (!activeSection.startsWith('violations')) return null

    const filteredStudents = students.filter((s: any) => {
      const name = getStudentDisplayName(s).toLowerCase()
      const q = violationFilters.name.toLowerCase()
      const matchName = !q || name.includes(q)
      const matchGrade = !violationFilters.gradeLevel || (s.gradeLevel || s.grade) === violationFilters.gradeLevel
      const matchSection = !violationFilters.section || (s.section || '') === violationFilters.section
      const matchTrack = !violationFilters.trackStrand || (s.trackStrand || '') === violationFilters.trackStrand
      const matchHasViolation = !onlyWithViolations || (studentsWithViolations?.includes(Number(s.id)) ?? false)
      return matchName && matchGrade && matchSection && matchTrack && matchHasViolation
    })

    const handleSelectStudent = async (stu: any) => {
      setSelectedViolationStudent(stu)
      setViolationsForStudent(null)
      setViolationsDialogOpen(true)
      try {
        const list = await listViolationsByStudent(Number(stu.id))
        setViolationsForStudent(list)
      } catch {
        setViolationsForStudent([])
      }
    }

    return (
      <div className="space-y-6">
        <div className="animate-slide-in-top">
          <h1>Violation Records</h1>
          <p className="text-muted-foreground">Filter students and view their violations</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search and narrow down students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Search name"
                  value={violationFilters.name}
                  onChange={(e) => setViolationFilters(v => ({ ...v, name: e.target.value }))}
                />
              </div>
              <div>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={violationFilters.gradeLevel}
                  onChange={(e) => setViolationFilters(v => ({ ...v, gradeLevel: e.target.value }))}
                >
                  <option value="">All Grades</option>
                  {studentMeta.gradeLevels.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={violationFilters.section}
                  onChange={(e) => setViolationFilters(v => ({ ...v, section: e.target.value }))}
                >
                  <option value="">All Sections</option>
                  {studentMeta.sections.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={violationFilters.trackStrand}
                  onChange={(e) => setViolationFilters(v => ({ ...v, trackStrand: e.target.value }))}
                >
                  <option value="">All Tracks/Strands</option>
                  {studentMeta.trackStrands.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={onlyWithViolations} onChange={(e) => setOnlyWithViolations(e.target.checked)} />
                Only with violations
              </label>
              <div>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={violationDateFilter}
                  onChange={(e) => setViolationDateFilter(e.target.value)}
                  placeholder="Filter by date"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students list */}
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>Click a student to view violations</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredStudents.length ? (
              <div className="space-y-2">
                {filteredStudents.slice(0, 200).map((stu: any) => (
                  <div key={stu.id} className="flex items-center justify-between p-3 rounded border hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8"><AvatarFallback>{getStudentInitials(stu)}</AvatarFallback></Avatar>
                      <div>
                        <div className="text-sm font-medium">{getStudentDisplayName(stu)}</div>
                        <div className="text-xs text-muted-foreground">LRN: {stu.lrn} • Grade {stu.gradeLevel || stu.grade || ''} • {stu.section || ''}</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleSelectStudent(stu)}>View Violations</Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No students match your filters.</div>
            )}
          </CardContent>
        </Card>

        {/* Violations Dialog */}
        <Dialog open={violationsDialogOpen} onOpenChange={setViolationsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Violations for {selectedViolationStudent ? getStudentDisplayName(selectedViolationStudent) : ''}
              </DialogTitle>
              <DialogDescription>All records for this student</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {violationsForStudent == null ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : violationsForStudent.length ? (
                <div className="space-y-2">
                  {violationsForStudent.map(v => (
                    <div key={v.id} className="grid grid-cols-[2fr,1fr,1fr,auto] items-center gap-3 p-3 rounded border">
                      <div>
                        <div className="text-sm font-medium">{v.violationType}</div>
                        <div className="text-xs text-muted-foreground">{v.description || ''}</div>
                      </div>
                      <div className="text-sm">{v.date}</div>
                      <div>
                        <Badge variant={v.severity === 'Severe' ? 'destructive' : v.severity === 'Major' ? 'default' : 'secondary'}>{v.severity}</Badge>
                      </div>
                      <div>
                        <Badge variant={v.status === 'Resolved' ? 'default' : v.status === 'Appealed' ? 'secondary' : 'outline'}>{v.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No violations found for this student.</div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  const getContent = () => {
    if (activeSection === 'dashboard' || activeSection === 'dashboard-overview') {
      return renderDashboardOverview()
    } else if (activeSection.startsWith('appointments')) {
      return renderAppointments()
    } else if (activeSection.startsWith('students')) {
      return renderStudents()
    } else if (activeSection.startsWith('incidents')) {
      return renderIncidents()
    } else if (activeSection.startsWith('sessions')) {
      if (activeSection === 'sessions-session-records') return renderSessions()
      return (
        <div className="space-y-6 p-6">
          <div className="animate-slide-in-top">
            <h1>Session Fill-up Form</h1>
            <p className="text-muted-foreground">Create and manage counseling and guidance sessions</p>
          </div>
          <SessionFillupForm students={students} onSessionAdd={handleSessionAdd} />
        </div>
      )
    } else if (activeSection.startsWith('violations')) {
      return (
        <div className="space-y-6">
          <div className="animate-slide-in-top">
            <h1>Violation Records</h1>
            <p className="text-muted-foreground">Track student violations and disciplinary actions</p>
          </div>
          {/* Violations section is rendered via renderViolations */}
          {renderViolations()}
        </div>
      )
    }
    
    return renderDashboardOverview()
  }

  return (
    <div className="p-6">
      {getContent()}
    </div>
  )
}