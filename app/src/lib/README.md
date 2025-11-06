# Centralized Data API

A powerful, type-safe data management system for the Guidance Office Management Information System (GOMIS).

## 📁 Files Overview

- **`api.ts`** - Main API class with all data operations
- **`../hooks/useData.ts`** - React hooks for reactive data management
- **`api-usage-examples.md`** - Comprehensive usage guide and examples
- **`api-example-component.tsx`** - Live React component examples

## 🚀 Quick Start

### Option 1: Using React Hooks (Recommended)

```typescript
import { useStudents } from '../hooks/useData'

function MyComponent() {
  const { students, loading, createStudent, updateStudent } = useStudents()
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      {students.map(student => (
        <div key={student.id}>{student.firstName}</div>
      ))}
    </div>
  )
}
```

### Option 2: Direct API Usage

```typescript
import api from '../lib/api'

// Get all students
const students = api.getAllStudents()

// Create a student
const newStudent = api.createStudent({
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

// Update a student
api.updateStudent(student.id, { status: 'Dropped' })
```

## 🎯 Key Features

### ✅ Type Safety
Full TypeScript support with comprehensive interfaces for all data types:
- `Student`
- `Appointment`
- `Session`
- `Incident`
- `Violation`
- `User`
- `Settings`
- `DroppingForm`
- `GoodMoralCertificate`

### ✅ Automatic Management
- **Auto-generated IDs**: No need to manually create unique identifiers
- **Timestamps**: Automatic `createdAt` and `updatedAt` fields
- **Event System**: Real-time updates across components

### ✅ React Integration
Custom hooks for seamless React integration:
- `useStudents()` - Student data management
- `useAppointments()` - Appointment scheduling
- `useSessions()` - Session tracking
- `useIncidents()` - Incident management
- `useViolations()` - Violation records
- `useSettings()` - Application settings
- `useCurrentUser()` - User authentication
- `useStatistics()` - Dashboard analytics
- `useCalendarEvents()` - Calendar integration

### ✅ Event-Driven Architecture
```typescript
// Listen for changes
api.on('students', (student) => {
  console.log('Student updated:', student)
})

// Stop listening
api.off('students', callback)
```

### ✅ Advanced Queries
```typescript
// Search students
const results = api.searchStudents('Juan')

// Get by status
const activeStudents = api.getStudentsByStatus('Active')

// Get appointments by date
const todayAppointments = api.getAppointmentsByDate('2025-10-20')

// Get calendar events for month
const events = api.getAllEventsForMonth(2025, 9) // October
```

### ✅ Data Export/Import
```typescript
// Export all data as JSON
const jsonData = api.exportAllData()

// Import data
api.importData(jsonData)

// Clear all data (careful!)
api.clearAllData()
```

### ✅ Statistics & Analytics
```typescript
const stats = api.getStatistics()
// Returns:
// {
//   totalStudents, activeStudents, droppedStudents,
//   totalAppointments, scheduledAppointments, completedAppointments,
//   totalSessions, individualSessions, groupSessions,
//   totalIncidents, openIncidents, resolvedIncidents
// }
```

## 📚 Available Hooks

| Hook | Purpose | Returns |
|------|---------|---------|
| `useStudents()` | Student management | `{ students, loading, createStudent, updateStudent, deleteStudent, ... }` |
| `useAppointments()` | Appointment scheduling | `{ appointments, loading, createAppointment, updateAppointment, ... }` |
| `useSessions()` | Session tracking | `{ sessions, loading, createSession, updateSession, ... }` |
| `useIncidents()` | Incident management | `{ incidents, loading, createIncident, updateIncident, ... }` |
| `useViolations()` | Violation records | `{ violations, loading, createViolation, updateViolation, ... }` |
| `useSettings()` | App settings | `{ settings, loading, updateSettings }` |
| `useCurrentUser()` | Current user data | `{ user, loading, updateUser, logout }` |
| `useStatistics()` | Dashboard stats | `{ stats, loading, refresh }` |
| `useCalendarEvents(year, month)` | Calendar events | `{ events, loading, refresh }` |

## 🔄 Data Flow

```
Component → Hook/API → localStorage → Event Emitter → All Listening Components Update
```

1. Component calls API method or hook
2. API updates localStorage
3. Event emitter notifies all listeners
4. Components using hooks automatically re-render with new data

## 🎨 Usage Patterns

### Pattern 1: List with CRUD Operations
```typescript
function StudentManager() {
  const { students, createStudent, updateStudent, deleteStudent } = useStudents()
  
  return (
    <div>
      <button onClick={() => createStudent(data)}>Add</button>
      {students.map(s => (
        <div key={s.id}>
          <button onClick={() => updateStudent(s.id, updates)}>Edit</button>
          <button onClick={() => deleteStudent(s.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}
```

### Pattern 2: Statistics Dashboard
```typescript
function Dashboard() {
  const { stats } = useStatistics()
  
  return (
    <div>
      <Card>Total Students: {stats?.totalStudents}</Card>
      <Card>Active: {stats?.activeStudents}</Card>
    </div>
  )
}
```

### Pattern 3: Calendar Integration
```typescript
function Calendar() {
  const [date, setDate] = useState(new Date())
  const { events } = useCalendarEvents(date.getFullYear(), date.getMonth())
  
  return (
    <div>
      {Array.from(events.entries()).map(([dateStr, dayEvents]) => (
        <Day key={dateStr} events={dayEvents} />
      ))}
    </div>
  )
}
```

### Pattern 4: Settings Form
```typescript
function SettingsForm() {
  const { settings, updateSettings } = useSettings()
  
  return (
    <form>
      <input
        value={settings?.dbConfig || ''}
        onChange={(e) => updateSettings({ dbConfig: e.target.value })}
      />
    </form>
  )
}
```

## 🔧 Migration from Old Code

### Before
```typescript
// Direct localStorage manipulation - Hard to maintain
const students = JSON.parse(localStorage.getItem('gomis_students') || '[]')
students.push({ id: Date.now(), ...data })
localStorage.setItem('gomis_students', JSON.stringify(students))
```

### After
```typescript
// Clean API - Easy to maintain and test
const student = api.createStudent(data)
```

## 🛠️ Backend Migration Path

The API is designed to make backend migration simple:

```typescript
// Current (localStorage)
const students = api.getAllStudents()

// Future (with backend)
class DataAPI {
  async getAllStudents() {
    const response = await fetch('/api/students')
    return response.json()
  }
}
```

All components using the API will work without changes!

## 📖 Documentation

- **Full API Reference**: See `api.ts` for all available methods
- **Usage Examples**: See `api-usage-examples.md` for detailed examples
- **Live Examples**: See `api-example-component.tsx` for working React components

## 🎯 Best Practices

1. ✅ **DO** use hooks in React components
2. ✅ **DO** handle loading states
3. ✅ **DO** use TypeScript interfaces
4. ✅ **DO** listen to events for real-time updates
5. ❌ **DON'T** directly manipulate localStorage
6. ❌ **DON'T** create manual IDs
7. ❌ **DON'T** forget to handle errors

## 🔐 Data Persistence

All data is stored in localStorage with these keys:
- `gomis_registered_users` - User accounts
- `gomis_current_user` - Active user session
- `gomis_students` - Student records
- `gomis_appointments` - Appointment schedule
- `gomis_sessions` - Counseling sessions
- `gomis_incidents` - Incident reports
- `gomis_violations` - Violation records
- `gomis_settings` - App configuration
- `gomis_dropping_forms` - Dropping forms
- `gomis_certificates` - Good moral certificates

## 🚀 Performance

- ✅ Efficient localStorage operations
- ✅ Event-based updates (no polling)
- ✅ Memoized hooks prevent unnecessary re-renders
- ✅ Lazy loading support

## 🆘 Troubleshooting

**Problem**: Data not updating in UI
**Solution**: Use hooks instead of direct API calls

**Problem**: Lost data after refresh
**Solution**: Check browser console for errors; data persists in localStorage

**Problem**: Type errors
**Solution**: Import types: `import type { Student } from '../lib/api'`

## 📞 Support

For questions or issues:
1. Check `api-usage-examples.md` for examples
2. Review `api.ts` for method documentation
3. Look at `api-example-component.tsx` for working examples

---

**Built for GOMIS** - Making data management simple and maintainable.
