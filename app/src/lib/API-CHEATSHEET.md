# Data API Quick Reference

## 🎯 Import

```typescript
// Direct API
import api from '../lib/api'

// Hooks
import { useStudents, useAppointments, useSettings } from '../hooks/useData'

// Types
import type { Student, Appointment, Session, Incident } from '../lib/api'
```

---

## 📊 Students

```typescript
// Get all
const students = api.getAllStudents()

// Get by ID
const student = api.getStudentById('id')

// Get by status
const active = api.getStudentsByStatus('Active')

// Search
const results = api.searchStudents('Juan')

// Create
api.createStudent({
  lrn: '123456789012',
  firstName: 'Juan',
  lastName: 'Dela Cruz',
  grade: 'Grade 11',
  section: 'A',
  track: 'Academic',
  strand: 'STEM',
  specialization: 'Science, Technology, Engineering and Mathematics',
  status: 'Active'
})

// Update
api.updateStudent('id', { status: 'Dropped' })

// Delete
api.deleteStudent('id')

// Hook
const { students, loading, createStudent, updateStudent, deleteStudent } = useStudents()
```

---

## 📅 Appointments

```typescript
// Get all
const appointments = api.getAllAppointments()

// Get by date
const todayAppts = api.getAppointmentsByDate('2025-10-20')

// Get by student
const studentAppts = api.getAppointmentsByStudent('student-id')

// Create
api.createAppointment({
  studentId: 'student-id',
  studentName: 'Juan Dela Cruz',
  date: '2025-10-20',
  time: '10:00 AM',
  purpose: 'Academic Counseling',
  status: 'Scheduled'
})

// Update
api.updateAppointment('id', { status: 'Completed' })

// Delete
api.deleteAppointment('id')

// Hook
const { appointments, createAppointment, updateAppointment } = useAppointments()
```

---

## 🎓 Sessions

```typescript
// Get all
const sessions = api.getAllSessions()

// Get by date
const todaySessions = api.getSessionsByDate('2025-10-20')

// Get by participant
const studentSessions = api.getSessionsByParticipant('student-id')

// Create
api.createSession({
  sessionId: 'SES-2025-001',
  date: '2025-10-20',
  time: '2:00 PM',
  type: 'Group',
  category: 'Academic',
  participants: ['student-id-1', 'student-id-2'],
  topic: 'Study Skills Workshop'
})

// Update
api.updateSession('id', { outcome: 'Session completed successfully' })

// Hook
const { sessions, createSession, updateSession } = useSessions()
```

---

## ⚠️ Incidents

```typescript
// Get all
const incidents = api.getAllIncidents()

// Get by student
const studentIncidents = api.getIncidentsByStudent('student-id')

// Create
api.createIncident({
  incidentId: 'INC-2025-001',
  date: '2025-10-18',
  time: '11:30 AM',
  location: 'Cafeteria',
  type: 'Physical Altercation',
  severity: 'Medium',
  studentsInvolved: ['student-id-1'],
  description: 'Minor dispute',
  status: 'Open'
})

// Update
api.updateIncident('id', { status: 'Resolved' })

// Hook
const { incidents, createIncident, updateIncident } = useIncidents()
```

---

## 👤 Users

```typescript
// Register
api.registerUser({
  email: 'user@school.edu',
  password: 'password',
  firstName: 'Anna',
  lastName: 'Garcia',
  position: 'Guidance Counselor'
})

// Login
const user = api.loginUser('email', 'password')

// Get current
const currentUser = api.getCurrentUser()

// Update
api.updateUser('id', { position: 'Senior Counselor' })

// Logout
api.logoutUser()

// Hook
const { user, updateUser, logout } = useCurrentUser()
```

---

## ⚙️ Settings

```typescript
// Get settings
const settings = api.getSettings()

// Update
api.updateSettings({
  twoFactorEnabled: true,
  dbConfig: 'mongodb://localhost:27017/gomisdb',
  retentionValue: '5',
  retentionType: 'years'
})

// Hook
const { settings, updateSettings } = useSettings()
```

---

## 📈 Statistics

```typescript
// Get all stats
const stats = api.getStatistics()
// Returns: totalStudents, activeStudents, totalAppointments, etc.

// Hook
const { stats, loading } = useStatistics()
```

---

## 📆 Calendar

```typescript
// Get events for date
const events = api.getEventsByDate('2025-10-20')
// Returns: { appointments: [], sessions: [], incidents: [] }

// Get events for month
const monthEvents = api.getAllEventsForMonth(2025, 9) // October
// Returns: Map<date, { appointments, sessions, incidents }>

// Hook
const { events, loading } = useCalendarEvents(2025, 9)
```

---

## 🔄 Events

```typescript
// Listen to changes
api.on('students', (data) => {
  console.log('Student changed:', data)
})

// Stop listening
api.off('students', callback)

// Event types: 'students', 'appointments', 'sessions', 'incidents', 'violations', 'settings', 'user'
```

---

## 💾 Data Management

```typescript
// Export all data
const jsonData = api.exportAllData()

// Import data
api.importData(jsonData)

// Clear all (careful!)
api.clearAllData()
```

---

## 🎣 All Available Hooks

```typescript
useStudents()        // Student management
useAppointments()    // Appointment scheduling
useSessions()        // Session tracking
useIncidents()       // Incident management
useViolations()      // Violation records
useSettings()        // App settings
useCurrentUser()     // Current user
useStatistics()      // Dashboard stats
useCalendarEvents(year, month) // Calendar events
```

---

## 📝 Common Patterns

### Create with form data
```typescript
const handleSubmit = (formData) => {
  api.createStudent({
    lrn: formData.get('lrn'),
    firstName: formData.get('firstName'),
    // ...
  })
}
```

### Update on button click
```typescript
<button onClick={() => api.updateStudent(id, { status: 'Inactive' })}>
  Mark Inactive
</button>
```

### Filter and display
```typescript
const { students } = useStudents()
const activeStudents = students.filter(s => s.status === 'Active')
```

### Real-time updates
```typescript
useEffect(() => {
  const handler = () => refreshData()
  api.on('students', handler)
  return () => api.off('students', handler)
}, [])
```

---

## ⚡ Quick Tips

1. Use **hooks** in React components
2. Use **direct API** in utility functions
3. **Loading states** are handled by hooks
4. **Auto-updates** via event system
5. **Type safety** with TypeScript

---

## 🎯 Next Steps

- Read `/lib/README.md` for overview
- Check `/lib/api-usage-examples.md` for detailed examples
- View `/lib/api-example-component.tsx` for working code
- Explore `/lib/api.ts` for full documentation
