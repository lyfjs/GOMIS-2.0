import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Badge } from './ui/badge'
import { Search, Plus, Trash2, User, Users, Calendar as CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Calendar } from './ui/calendar'
import { cn } from './ui/utils'
import { createViolation } from '../lib/api.violations'
import { createIncident } from '../lib/api.incidents'
import { emit } from '../lib/events'

interface StudentDTO {
  id?: number
  lrn: string
  firstName: string
  middleName?: string
  lastName: string
  gradeLevel?: string
  section?: string
}

interface Participant {
  id: string
  studentId?: string | number
  name: string
  type: 'Student' | 'Non-Student'
  grade?: string
  section?: string
}

interface IncidentFillupFormProps {
  students: StudentDTO[]
  onIncidentAdd: (incident: any) => void
}

function getStudentDisplayName(s: StudentDTO) {
  return `${s.firstName} ${s.middleName || ''} ${s.lastName}`.replace(/\s+/g, ' ').trim()
}

function formatYmd(d?: Date | string) {
  if (!d) return ''
  const date = typeof d === 'string' ? new Date(d) : d
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function IncidentFillupForm({ students, onIncidentAdd }: IncidentFillupFormProps) {
  const [reportedBy, setReportedBy] = useState<StudentDTO | null>(null)
  const [incidentDate, setIncidentDate] = useState<Date | undefined>()
  const [incidentTime, setIncidentTime] = useState('')
  const [status, setStatus] = useState('Pending')
  const [narrativeDate, setNarrativeDate] = useState<Date | undefined>()
  const [narrativeTime, setNarrativeTime] = useState('')
  const [narrativeDescription, setNarrativeDescription] = useState('')
  const [actionTaken, setActionTaken] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [participants, setParticipants] = useState<Participant[]>([])
  const [studentSearchOpen, setStudentSearchOpen] = useState(false)
  const [participantSearchOpen, setParticipantSearchOpen] = useState(false)
  const [nonStudentDialogOpen, setNonStudentDialogOpen] = useState(false)
  const [nonStudentName, setNonStudentName] = useState('')

  const handleReportedBySelect = (student: StudentDTO) => {
    setReportedBy(student)
    setStudentSearchOpen(false)
  }

  const handleAddParticipant = (student: StudentDTO) => {
    const newParticipant: Participant = {
      id: `${Date.now()}-${student.lrn}`,
      studentId: student.id ?? student.lrn,
      name: getStudentDisplayName(student),
      type: 'Student',
      grade: student.gradeLevel,
      section: student.section
    }
    setParticipants(prev => [...prev, newParticipant])
    setParticipantSearchOpen(false)
    toast.success('Participant added')
  }

  const handleAddNonStudent = () => {
    if (!nonStudentName.trim()) {
      toast.error('Please enter a name')
      return
    }
    const newParticipant: Participant = {
      id: `${Date.now()}-${nonStudentName}`,
      name: nonStudentName,
      type: 'Non-Student'
    }
    setParticipants(prev => [...prev, newParticipant])
    setNonStudentName('')
    setNonStudentDialogOpen(false)
    toast.success('Non-student participant added')
  }

  const handleRemoveParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id))
    toast.success('Participant removed')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportedBy) {
      toast.error('Please select who reported the incident')
      return
    }
    if (!incidentDate || !incidentTime) {
      toast.error('Please fill in incident date and time')
      return
    }
    if (!narrativeDescription.trim()) {
      toast.error('Please provide a narrative description')
      return
    }

    const payload = {
      reportedBy: getStudentDisplayName(reportedBy),
      reportedByLRN: reportedBy.lrn,
      grade: reportedBy.gradeLevel,
      section: reportedBy.section,
      date: formatYmd(incidentDate),
      time: incidentTime,
      status,
      narrativeDate: narrativeDate ? formatYmd(narrativeDate) : '',
      narrativeTime,
      narrativeDescription,
      actionTaken,
      recommendation,
      participants,
    }

    try {
      const created = await createIncident(payload as any)
      onIncidentAdd(created)
      emit('data:incidents', created)
    } catch {
      const fallback = { id: `INC-${Date.now()}`, ...payload, createdAt: new Date().toISOString() }
      onIncidentAdd(fallback)
      emit('data:incidents', fallback)
    }

    try {
      await createViolation({
        studentId: Number(reportedBy.id || 0),
        studentName: getStudentDisplayName(reportedBy),
        studentLRN: reportedBy.lrn,
        violationType: 'Incident',
        date: formatYmd(incidentDate),
        description: narrativeDescription,
        severity: 'Minor',
        actionTaken: actionTaken || undefined,
        status: 'Pending',
      })
      emit('data:violations')
    } catch {}

    setReportedBy(null)
    setIncidentDate(undefined)
    setIncidentTime('')
    setStatus('Pending')
    setNarrativeDate(undefined)
    setNarrativeTime('')
    setNarrativeDescription('')
    setActionTaken('')
    setRecommendation('')
    setParticipants([])

    toast.success('Incident report created successfully!')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>1. Incident Details</CardTitle>
          <CardDescription>Basic information about the incident</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Reported by *</Label>
              <Dialog open={studentSearchOpen} onOpenChange={setStudentSearchOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="h-4 w-4 mr-2" />
                    {reportedBy ? `${getStudentDisplayName(reportedBy)} (${reportedBy.lrn})` : 'Search student'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Search Student</DialogTitle>
                    <DialogDescription>Select the student who reported the incident</DialogDescription>
                  </DialogHeader>
                  <Command>
                    <CommandInput placeholder="Search by name or LRN..." />
                    <CommandList>
                      <CommandEmpty>No students found.</CommandEmpty>
                      <CommandGroup>
                        {students.map((student) => (
                          <CommandItem
                            key={student.lrn}
                            onSelect={() => handleReportedBySelect(student)}
                          >
                            <User className="h-4 w-4 mr-2" />
                            <div>
                              <p>{getStudentDisplayName(student)}</p>
                              <p className="text-xs text-muted-foreground">
                                LRN: {student.lrn} • Grade {student.gradeLevel || ''} - {student.section || ''}
                              </p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              <Label>Grade & Section</Label>
              <Input 
                value={reportedBy ? `Grade ${reportedBy.gradeLevel || ''} - ${reportedBy.section || ''}` : ''} 
                disabled 
                placeholder="Auto-filled from selected student"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Incident Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left",
                      !incidentDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {incidentDate ? formatYmd(incidentDate) : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={incidentDate}
                    onSelect={setIncidentDate}
                    fromYear={2020}
                    toYear={new Date().getFullYear() + 1}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="incidentTime">Time *</Label>
              <Input 
                id="incidentTime"
                type="time" 
                value={incidentTime}
                onChange={(e) => setIncidentTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Ongoing Investigation">Ongoing Investigation</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Narrative Report</CardTitle>
          <CardDescription>Describe the incident in detail (What happened, who was involved, where, when, and why)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>When (Date)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left",
                      !narrativeDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {narrativeDate ? formatYmd(narrativeDate) : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={narrativeDate}
                    onSelect={setNarrativeDate}
                    fromYear={2020}
                    toYear={new Date().getFullYear() + 1}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="narrativeTime">When (Time)</Label>
              <Input 
                id="narrativeTime"
                type="time" 
                value={narrativeTime}
                onChange={(e) => setNarrativeTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="narrativeDescription">Full Description / Narrative *</Label>
            <Textarea 
              id="narrativeDescription"
              placeholder="Provide a detailed description of what happened, who was involved, where it occurred, when it happened, and why it occurred..."
              value={narrativeDescription}
              onChange={(e) => setNarrativeDescription(e.target.value)}
              rows={6}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Initial Actions & Recommendations</CardTitle>
          <CardDescription>Document immediate actions taken and recommendations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="actionTaken">Action Taken</Label>
            <Textarea 
              id="actionTaken"
              placeholder="Describe any immediate actions that were taken..."
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendation">Recommendation</Label>
            <Textarea 
              id="recommendation"
              placeholder="Provide recommendations for follow-up or resolution..."
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Participants</CardTitle>
          <CardDescription>Add all individuals involved in this incident</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Dialog open={participantSearchOpen} onOpenChange={setParticipantSearchOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Participant
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Participant</DialogTitle>
                  <DialogDescription>Search and select a student to add as participant</DialogDescription>
                </DialogHeader>
                <Command>
                  <CommandInput placeholder="Search by name or LRN..." />
                  <CommandList>
                    <CommandEmpty>No students found.</CommandEmpty>
                    <CommandGroup>
                      {students.map((student) => (
                        <CommandItem
                          key={student.lrn}
                          onSelect={() => handleAddParticipant(student)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          <div>
                            <p>{getStudentDisplayName(student)}</p>
                            <p className="text-xs text-muted-foreground">
                              LRN: {student.lrn} • Grade {student.gradeLevel || ''} - {student.section || ''}
                            </p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </DialogContent>
            </Dialog>

            <Dialog open={nonStudentDialogOpen} onOpenChange={setNonStudentDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Add Non-Student
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Non-Student</DialogTitle>
                  <DialogDescription>Enter the name of a non-student participant</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nonStudentName">Name</Label>
                    <Input
                      id="nonStudentName"
                      placeholder="Enter name..."
                      value={nonStudentName}
                      onChange={(e) => setNonStudentName(e.target.value)}
                    />
                  </div>
                  <Button type="button" onClick={handleAddNonStudent} className="w-full">
                    Add
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {participants.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr,2fr,1fr,1fr,auto] gap-4 p-3 bg-muted rounded-md">
                <div className="text-sm font-medium">Student ID</div>
                <div className="text-sm font-medium">Name</div>
                <div className="text-sm font-medium">Type</div>
                <div className="text-sm font-medium">Grade & Section</div>
                <div className="text-sm font-medium">Action</div>
              </div>
              {participants.map((participant) => (
                <div key={participant.id} className="grid grid-cols-[1fr,2fr,1fr,1fr,auto] gap-4 p-3 border rounded-md items-center">
                  <div className="text-sm">{participant.studentId || 'N/A'}</div>
                  <div className="text-sm">{participant.name}</div>
                  <div>
                    <Badge variant={participant.type === 'Student' ? 'default' : 'secondary'}>
                      {participant.type}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    {participant.grade && participant.section 
                      ? `Grade ${participant.grade} - ${participant.section}` 
                      : 'N/A'}
                  </div>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRemoveParticipant(participant.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md border-dashed">
              <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No participants added yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg">
          Submit Incident Report
        </Button>
      </div>
    </form>
  )
}
