import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Calendar } from './ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command'
import { CalendarIcon, Search, Plus, X, Check, ChevronsUpDown } from 'lucide-react'
import { cn } from './ui/utils'
import { toast } from 'sonner@2.0.3'
import { createViolation } from '../lib/api.violations'
import { createSession } from '../lib/api.sessions'
import { emit } from '../lib/events'

interface SessionFillupFormProps {
  students: any[]
  onSessionAdd: (session: any) => void
}

const VIOLATION_TYPES = [
  'Absence/Late',
  'Minor Property Damage',
  'Threatening/Intimidating',
  'Pornographic Materials',
  'Gadget Use in Class',
  'Cheating',
  'Stealing',
  'No Pass',
  'Bullying',
  'Sexual Abuse',
  'Illegal Drugs',
  'Alcohol',
  'Smoking/Vaping',
  'Gambling',
  'Public Display of Affection',
  'Fighting/Weapons',
  'Severe Property Damage',
  'Others',
]

function getStudentDisplayName(s: any) {
  return `${s.firstName || ''} ${s.middleName || ''} ${s.lastName || ''}`.replace(/\s+/g, ' ').trim()
}

function getInitials(s: any) {
  const name = getStudentDisplayName(s)
  return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'ST'
}

export function SessionFillupForm({ students, onSessionAdd }: SessionFillupFormProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [sessionDate, setSessionDate] = useState<Date | undefined>()
  const [includedParticipants, setIncludedParticipants] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const [sectionComboboxOpen, setSectionComboboxOpen] = useState(false)

  const availableSections = useMemo(() => {
    const sections = new Set<string>()
    students.forEach(student => {
      if (student.section) sections.add(student.section)
    })
    return Array.from(sections).sort()
  }, [students])

  const [formData, setFormData] = useState({
    sessionTime: '',
    appointmentType: '',
    consultationType: '',
    sessionStatus: '',
    notes: '',
    searchName: '',
    searchMiddleName: '',
    searchLastName: '',
    searchAge: '',
    searchGender: '',
    searchSection: '',
    searchGrade: '',
    sessionSummary: '',
    violationType: '',
    violationDescription: '',
    reinforcement: '',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSearch = () => {
    const results = students.filter(student => {
      const nameMatch = !formData.searchName || 
        (student.firstName || '').toLowerCase().includes(formData.searchName.toLowerCase())
      const middleNameMatch = !formData.searchMiddleName || 
        (student.middleName || '').toLowerCase().includes(formData.searchMiddleName.toLowerCase())
      const lastNameMatch = !formData.searchLastName || 
        (student.lastName || '').toLowerCase().includes(formData.searchLastName.toLowerCase())
      const genderText = (student.gender || '').toString().toLowerCase()
      const genderMatch = !formData.searchGender || 
        genderText.includes(formData.searchGender.toLowerCase())
      const sectionMatch = !formData.searchSection || 
        (student.section || '').toLowerCase().includes(formData.searchSection.toLowerCase())
      const gradeMatch = !formData.searchGrade || 
        (student.gradeLevel || student.grade) === formData.searchGrade

      return nameMatch && middleNameMatch && lastNameMatch && genderMatch && sectionMatch && gradeMatch
    })

    setSearchResults(results)
    setShowResults(true)
  }

  const handleAddParticipant = (student: any) => {
    if (!includedParticipants.find(p => p.lrn === student.lrn)) {
      setIncludedParticipants(prev => [...prev, student])
      toast.success(`${getStudentDisplayName(student)} added to session`)
    } else {
      toast.info('Participant already added')
    }
  }

  const handleRemoveParticipant = (lrn: string) => {
    setIncludedParticipants(prev => prev.filter(p => p.lrn !== lrn))
    toast.info('Participant removed')
  }

  const handleReset = () => {
    setFormData({
      sessionTime: '',
      appointmentType: '',
      consultationType: '',
      sessionStatus: '',
      notes: '',
      searchName: '',
      searchMiddleName: '',
      searchLastName: '',
      searchAge: '',
      searchGender: '',
      searchSection: '',
      searchGrade: '',
      sessionSummary: '',
      violationType: '',
      violationDescription: '',
      reinforcement: '',
    })
    setSessionDate(undefined)
    setIncludedParticipants([])
    setSearchResults([])
    setShowResults(false)
    setShowResetConfirm(false)
    toast.info('Form reset')
  }

  const handleResetClick = () => {
    setShowResetConfirm(true)
  }

  const handleSubmit = async () => {
    const dateStr = sessionDate ? `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2,'0')}-${String(sessionDate.getDate()).padStart(2,'0')}` : ''
    const payload = {
      date: dateStr,
      time: formData.sessionTime,
      appointmentType: formData.appointmentType,
      consultationType: formData.consultationType,
      status: formData.sessionStatus,
      notes: formData.notes,
      participants: includedParticipants,
      summary: formData.sessionSummary,
    }

    try {
      const created = await createSession(payload as any)
      onSessionAdd(created)
      emit('data:sessions', created)
    } catch {
      const fallback = { id: Date.now(), ...payload }
      onSessionAdd(fallback)
      emit('data:sessions', fallback)
    }

    try {
      if (formData.violationType && includedParticipants.length) {
        await Promise.all(includedParticipants.map((p: any) => createViolation({
          studentId: Number(p.id || 0),
          studentName: `${p.firstName || ''} ${p.middleName || ''} ${p.lastName || ''}`.replace(/\s+/g,' ').trim() || p.name,
          studentLRN: p.lrn,
          violationType: formData.violationType,
          date: dateStr,
          description: formData.violationDescription || undefined,
          severity: 'Minor',
          actionTaken: formData.reinforcement || undefined,
          status: 'Pending',
        })))
        emit('data:violations')
      }
    } catch {}

    handleReset()
    toast.success('Session created successfully!')
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Select date'
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Session Details</CardTitle>
            <CardDescription>Basic session information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Session Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left",
                        !sessionDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDate(sessionDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={sessionDate}
                      onSelect={setSessionDate}
                      fromYear={2020}
                      toYear={new Date().getFullYear() + 1}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTime">Session Time *</Label>
                <Input
                  id="sessionTime"
                  type="time"
                  value={formData.sessionTime}
                  onChange={(e) => handleInputChange('sessionTime', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appointmentType">Appointment Type *</Label>
                <Select value={formData.appointmentType} onValueChange={(value) => handleInputChange('appointmentType', value)}>
                  <SelectTrigger id="appointmentType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Walk-in">Walk-in</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="consultationType">Consultation Type *</Label>
                <Select value={formData.consultationType} onValueChange={(value) => handleInputChange('consultationType', value)}>
                  <SelectTrigger id="consultationType">
                    <SelectValue placeholder="Select consultation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Academic Counseling">Academic Counseling</SelectItem>
                    <SelectItem value="Career Guidance">Career Guidance</SelectItem>
                    <SelectItem value="Personal Counseling">Personal Counseling</SelectItem>
                    <SelectItem value="Behavioral Intervention">Behavioral Intervention</SelectItem>
                    <SelectItem value="Crisis Intervention">Crisis Intervention</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionStatus">Session Status *</Label>
                <Select value={formData.sessionStatus} onValueChange={(value) => handleInputChange('sessionStatus', value)}>
                  <SelectTrigger id="sessionStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Ended">Ended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Enter session notes..."
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Participants</CardTitle>
            <CardDescription>Search and add participants to this session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label htmlFor="searchName">Search by Name</Label>
                  <Input
                    id="searchName"
                    placeholder="First name"
                    value={formData.searchName}
                    onChange={(e) => handleInputChange('searchName', e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="searchMiddleName">Middle Name</Label>
                  <Input
                    id="searchMiddleName"
                    placeholder="Middle name"
                    value={formData.searchMiddleName}
                    onChange={(e) => handleInputChange('searchMiddleName', e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="searchLastName">Last Name</Label>
                  <Input
                    id="searchLastName"
                    placeholder="Last name"
                    value={formData.searchLastName}
                    onChange={(e) => handleInputChange('searchLastName', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <Label htmlFor="searchAge">Age</Label>
                  <Input
                    id="searchAge"
                    placeholder="Age"
                    value={formData.searchAge}
                    onChange={(e) => handleInputChange('searchAge', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="searchGender">Gender</Label>
                  <div className="flex gap-2">
                    <Select value={formData.searchGender || undefined} onValueChange={(value) => handleInputChange('searchGender', value)}>
                      <SelectTrigger id="searchGender">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.searchGender && (
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleInputChange('searchGender', '')}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="searchSection">Section</Label>
                  <Popover open={sectionComboboxOpen} onOpenChange={setSectionComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={sectionComboboxOpen}
                        className="w-full justify-between"
                      >
                        {formData.searchSection || "Select section..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput 
                          placeholder="Search or type section..." 
                          value={formData.searchSection}
                          onValueChange={(value) => handleInputChange('searchSection', value)}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {formData.searchSection ? (
                              <div className="py-2 px-2 text-sm">
                                Press Enter to use "{formData.searchSection}"
                              </div>
                            ) : (
                              "No sections found."
                            )}
                          </CommandEmpty>
                          <CommandGroup>
                            {availableSections
                              .filter(section => 
                                section.toLowerCase().includes(formData.searchSection.toLowerCase())
                              )
                              .map((section) => (
                                <CommandItem
                                  key={section}
                                  value={section}
                                  onSelect={(currentValue) => {
                                    handleInputChange('searchSection', currentValue === formData.searchSection ? '' : currentValue)
                                    setSectionComboboxOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.searchSection === section ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {section}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="searchGrade">Grade</Label>
                  <div className="flex gap-2">
                    <Select value={formData.searchGrade || undefined} onValueChange={(value) => handleInputChange('searchGrade', value)}>
                      <SelectTrigger id="searchGrade">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="11">Grade 11</SelectItem>
                        <SelectItem value="12">Grade 12</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.searchGrade && (
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleInputChange('searchGrade', '')}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Button onClick={handleSearch} className="w-full gap-2">
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>

            {showResults && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Search Results</Label>
                  <Badge variant="secondary">{searchResults.length} found</Badge>
                </div>
                {searchResults.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
                    {searchResults.map((student) => (
                      <div key={student.lrn} className="flex items-center justify-between p-3 rounded-md border bg-card">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {getInitials(student)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{getStudentDisplayName(student)}</p>
                            <p className="text-xs text-muted-foreground">
                              LRN: {student.lrn} • Grade {student.gradeLevel || student.grade || ''} • Section: {student.section || ''}
                            </p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleAddParticipant(student)}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No students found</p>
                )}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Included Participants</Label>
                <Badge>{includedParticipants.length} participants</Badge>
              </div>
              {includedParticipants.length > 0 ? (
                <div className="space-y-2">
                  {includedParticipants.map((participant) => (
                    <div key={participant.lrn} className="flex items-center justify-between p-3 rounded-md border bg-muted">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {getInitials(participant)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{getStudentDisplayName(participant)}</p>
                          <p className="text-xs text-muted-foreground">
                            LRN: {participant.lrn} • Grade {participant.gradeLevel || participant.grade || ''} • Section: {participant.section || ''}
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleRemoveParticipant(participant.lrn)}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4 border rounded-md">
                  No participants added yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Session Summary</CardTitle>
            <CardDescription>Comprehensive summary of the session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="sessionSummary">Session Summary</Label>
              <Textarea
                id="sessionSummary"
                placeholder="Enter detailed session summary..."
                rows={6}
                value={formData.sessionSummary}
                onChange={(e) => handleInputChange('sessionSummary', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Violation Information</CardTitle>
            <CardDescription>Optional violation details if applicable</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="violationType">Violation Type</Label>
              <Select value={formData.violationType} onValueChange={(value) => handleInputChange('violationType', value)}>
                <SelectTrigger id="violationType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {VIOLATION_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="violationDescription">Violation Description</Label>
              <Textarea
                id="violationDescription"
                placeholder="Describe the violation..."
                rows={4}
                value={formData.violationDescription}
                onChange={(e) => handleInputChange('violationDescription', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reinforcement">Reinforcement/Intervention</Label>
              <Textarea
                id="reinforcement"
                placeholder="Describe reinforcement or intervention actions taken..."
                rows={4}
                value={formData.reinforcement}
                onChange={(e) => handleInputChange('reinforcement', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button variant="outline" onClick={handleResetClick}>
            Reset Form
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!sessionDate || !formData.sessionTime || !formData.appointmentType || !formData.consultationType || !formData.sessionStatus}
          >
            Create Session
          </Button>
        </div>
      </div>

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Form?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all the information you've entered including participants and session details. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
