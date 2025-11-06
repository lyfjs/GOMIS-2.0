import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react'
import { cn } from './ui/utils'

interface CalendarEvent {
  id: string | number
  title: string
  date: string
  time?: string
  type: 'appointment' | 'session' | 'incident'
  status?: string
}

interface CalendarViewProps {
  appointments: any[]
  sessions: any[]
  incidents: any[]
}

export function CalendarView({ appointments, sessions, incidents }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Get the first day of the month and the number of days in the month
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const firstDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const today = () => {
    setCurrentDate(new Date())
  }

  // Combine all events
  const getEventsForDate = (day: number): CalendarEvent[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const events: CalendarEvent[] = []

    // Add appointments
    appointments.forEach(apt => {
      if (apt.date === dateStr) {
        events.push({
          id: apt.id,
          title: apt.title,
          date: apt.date,
          time: apt.time,
          type: 'appointment',
          status: apt.status
        })
      }
    })

    // Add sessions (use session.date/time/consultationType)
    sessions.forEach(session => {
      if (session.date === dateStr) {
        events.push({
          id: session.id,
          title: `Session: ${session.consultationType || 'Counseling'}`,
          date: session.date,
          time: session.time,
          type: 'session',
          status: session.status
        })
      }
    })

    // Add incidents
    incidents.forEach(incident => {
      if (incident.date === dateStr) {
        events.push({
          id: incident.id,
          title: `Incident: ${incident.reportedBy}`,
          date: incident.date,
          time: incident.time,
          type: 'incident',
          status: incident.status
        })
      }
    })

    return events
  }

  // Generate calendar grid
  const calendarDays = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  // Check if a day is today
  const isToday = (day: number | null) => {
    if (!day) return false
    const today = new Date()
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'text-blue-600 dark:text-blue-400'
      case 'session':
        return 'text-green-600 dark:text-green-400'
      case 'incident':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getEventBadgeVariant = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'default'
      case 'session':
        return 'secondary'
      case 'incident':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {monthNames[month]} {year}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={today}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day names header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              const events = day ? getEventsForDate(day) : []
              
              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[120px] border rounded-lg p-2 transition-colors",
                    day ? "bg-background hover:bg-muted/50" : "bg-muted/20",
                    isToday(day) && "border-primary border-2 bg-primary/5"
                  )}
                >
                  {day && (
                    <>
                      <div className={cn(
                        "text-sm mb-2",
                        isToday(day) ? "font-bold" : "font-medium"
                      )}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {events.map((event) => (
                          <div
                            key={`${event.type}-${event.id}`}
                            className="flex items-start gap-1 text-xs group cursor-pointer"
                            title={`${event.title} ${event.time ? `at ${event.time}` : ''}`}
                          >
                            <Circle className={cn("h-2 w-2 mt-0.5 fill-current", getEventColor(event.type))} />
                            <span className="truncate flex-1 group-hover:text-foreground">
                              {event.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Event Types</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Circle className="h-3 w-3 fill-current text-blue-600 dark:text-blue-400" />
            <span className="text-sm">Appointments</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="h-3 w-3 fill-current text-green-600 dark:text-green-400" />
            <span className="text-sm">Sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="h-3 w-3 fill-current text-red-600 dark:text-red-400" />
            <span className="text-sm">Incidents</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
