/**
 * EXAMPLE COMPONENT - Demonstrates how to use the Data API
 * This file shows practical examples of using both the direct API and hooks
 */

import React, { useState } from 'react'
import { useStudents, useAppointments, useStatistics, useSettings } from '../hooks/useData'
import api from './api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

// ===========================
// Example 1: Using hooks (RECOMMENDED)
// ===========================

export function StudentListExample() {
  const { students, loading, createStudent, updateStudent, deleteStudent } = useStudents()
  const [searchQuery, setSearchQuery] = useState('')

  if (loading) {
    return <div>Loading students...</div>
  }

  const filteredStudents = searchQuery
    ? students.filter(s => 
        s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.lastName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : students

  const handleAddStudent = () => {
    createStudent({
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
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Students ({students.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <Button onClick={handleAddStudent}>Add Sample Student</Button>

          <div className="space-y-2">
            {filteredStudents.map(student => (
              <div key={student.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium">{student.firstName} {student.lastName}</p>
                  <p className="text-sm text-muted-foreground">
                    {student.grade} - {student.section} | {student.strand}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStudent(student.id, { status: 'Inactive' })}
                  >
                    Mark Inactive
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteStudent(student.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ===========================
// Example 2: Using Statistics Hook
// ===========================

export function DashboardStatsExample() {
  const { stats, loading } = useStatistics()

  if (loading || !stats) {
    return <div>Loading statistics...</div>
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Students</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.totalStudents}</p>
          <p className="text-sm text-muted-foreground">
            {stats.activeStudents} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.totalAppointments}</p>
          <p className="text-sm text-muted-foreground">
            {stats.scheduledAppointments} scheduled
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.totalSessions}</p>
          <p className="text-sm text-muted-foreground">
            {stats.groupSessions} group sessions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.totalIncidents}</p>
          <p className="text-sm text-muted-foreground">
            {stats.openIncidents} open
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// ===========================
// Example 3: Direct API Usage
// ===========================

export function DirectAPIExample() {
  const [result, setResult] = useState<string>('')

  const handleExportData = () => {
    const jsonData = api.exportAllData()
    setResult('Data exported! Check console.')
    console.log('Exported data:', jsonData)
  }

  const handleGetStats = () => {
    const stats = api.getStatistics()
    setResult(JSON.stringify(stats, null, 2))
  }

  const handleCreateAppointment = () => {
    const appointment = api.createAppointment({
      studentId: 'sample-student-id',
      studentName: 'Juan Dela Cruz',
      date: '2025-10-20',
      time: '10:00 AM',
      purpose: 'Academic Counseling',
      status: 'Scheduled'
    })
    setResult(`Appointment created! ID: ${appointment.id}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Direct API Operations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleExportData}>Export All Data</Button>
            <Button onClick={handleGetStats}>Get Statistics</Button>
            <Button onClick={handleCreateAppointment}>Create Appointment</Button>
          </div>

          {result && (
            <pre className="p-4 bg-muted rounded text-sm overflow-auto max-h-64">
              {result}
            </pre>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ===========================
// Example 4: Settings Management
// ===========================

export function SettingsExample() {
  const { settings, loading, updateSettings } = useSettings()

  if (loading || !settings) {
    return <div>Loading settings...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label>Two-Factor Authentication</label>
            <input
              type="checkbox"
              checked={settings.twoFactorEnabled}
              onChange={(e) => updateSettings({ twoFactorEnabled: e.target.checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <label>Email Notifications</label>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => updateSettings({ emailNotifications: e.target.checked })}
            />
          </div>

          <div className="space-y-2">
            <label>Database Configuration</label>
            <Input
              value={settings.dbConfig}
              onChange={(e) => updateSettings({ dbConfig: e.target.value })}
              placeholder="mongodb://localhost:27017/gomisdb"
            />
          </div>

          <div className="space-y-2">
            <label>Backup Path</label>
            <Input
              value={settings.backupPath}
              onChange={(e) => updateSettings({ backupPath: e.target.value })}
              placeholder="/backups/gomis"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ===========================
// Example 5: Appointments with filtering
// ===========================

export function AppointmentScheduleExample() {
  const { appointments, loading, createAppointment, updateAppointment } = useAppointments()
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed'>('all')

  if (loading) {
    return <div>Loading appointments...</div>
  }

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true
    if (filter === 'scheduled') return apt.status === 'Scheduled'
    if (filter === 'completed') return apt.status === 'Completed'
    return true
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All ({appointments.length})
            </Button>
            <Button
              variant={filter === 'scheduled' ? 'default' : 'outline'}
              onClick={() => setFilter('scheduled')}
            >
              Scheduled ({appointments.filter(a => a.status === 'Scheduled').length})
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              onClick={() => setFilter('completed')}
            >
              Completed ({appointments.filter(a => a.status === 'Completed').length})
            </Button>
          </div>

          <div className="space-y-2">
            {filteredAppointments.map(apt => (
              <div key={apt.id} className="p-3 border rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{apt.studentName}</p>
                    <p className="text-sm text-muted-foreground">
                      {apt.date} at {apt.time}
                    </p>
                    <p className="text-sm">{apt.purpose}</p>
                  </div>
                  <div className="space-x-2">
                    {apt.status === 'Scheduled' && (
                      <Button
                        size="sm"
                        onClick={() => updateAppointment(apt.id, { status: 'Completed' })}
                      >
                        Mark Complete
                      </Button>
                    )}
                    {apt.status === 'Scheduled' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateAppointment(apt.id, { status: 'Cancelled' })}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
