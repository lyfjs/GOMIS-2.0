import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Calendar } from './ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { CalendarIcon, Plus } from 'lucide-react'
import { cn } from './ui/utils'
import { createAppointment } from '../lib/api.appointments'
import { toast } from 'sonner'

// Simple date formatting function to avoid external dependencies
const formatDate = (date: Date, formatStr: string) => {
  if (formatStr === 'yyyy-MM-dd') {
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0')
  }
  if (formatStr === 'MMM dd, yyyy') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[date.getMonth()] + ' ' + 
           String(date.getDate()).padStart(2, '0') + ', ' + 
           date.getFullYear()
  }
  return date.toLocaleDateString()
}

interface AddAppointmentDialogProps {
  onAppointmentAdd: (appointment: any) => void
}

export function AddAppointmentDialog({ onAppointmentAdd }: AddAppointmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [date, setDate] = useState<Date>()
  const [formData, setFormData] = useState({
    title: '',
    consultationType: '',
    time: '',
    status: 'Scheduled',
    notes: '',
    participantName: '',
    participantType: 'STUDENT',
    participantLRN: ''
  })

  const consultationTypes = [
    'Academic Counseling',
    'Career Guidance', 
    'Personal Counseling',
    'Behavioral Intervention',
    'Crisis Counseling',
    'Family Counseling',
    'Group Counseling'
  ]

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!date || !formData.title || !formData.consultationType || !formData.time || !formData.participantName || (formData.participantType === 'STUDENT' && !formData.participantLRN)) {
      return
    }

    try {
      const time = formData.time.length === 5 ? `${formData.time}:00` : formData.time
      const payload = {
        date: formatDate(date, 'yyyy-MM-dd'),
        time,
        title: formData.title,
        consultationType: formData.consultationType,
        participantName: formData.participantName,
        participantType: formData.participantType as any,
        participantLRN: formData.participantType === 'STUDENT' ? formData.participantLRN : undefined,
        notes: formData.notes || undefined,
        status: 'SCHEDULED' as const,
      }
      const created = await createAppointment(payload)
      onAppointmentAdd(created)
      toast.success('Appointment scheduled and saved to database')
    } catch {
      toast.error('Failed to create appointment')
      return
    }
    
    // Reset form
    setFormData({
      title: '',
      consultationType: '',
      time: '',
      status: 'Scheduled',
      notes: '',
      participantName: '',
      participantType: 'STUDENT',
      participantLRN: ''
    })
    setDate(undefined)
    setIsOpen(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule New Appointment</DialogTitle>
          <DialogDescription>
            Create a new appointment for counseling or guidance sessions.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Appointment Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter appointment title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consultationType">Consultation Type *</Label>
            <Select value={formData.consultationType} onValueChange={(value) => handleSelectChange('consultationType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select consultation type" />
              </SelectTrigger>
              <SelectContent>
                {consultationTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? formatDate(date, "MMM dd, yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Select value={formData.time} onValueChange={(value) => handleSelectChange('time', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="participantName">Participant Name *</Label>
              <Input
                id="participantName"
                name="participantName"
                placeholder="Enter participant name"
                value={formData.participantName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="participantType">Participant Type</Label>
              <Select value={formData.participantType} onValueChange={(value) => handleSelectChange('participantType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="PARENT">Parent</SelectItem>
                  <SelectItem value="GUARDIAN">Guardian</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.participantType === 'STUDENT' && (
            <div className="space-y-2">
              <Label htmlFor="participantLRN">Participant LRN *</Label>
              <Input
                id="participantLRN"
                name="participantLRN"
                placeholder="Enter 12-digit LRN"
                value={formData.participantLRN}
                onChange={handleChange}
                pattern="\\d{12}"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Additional notes for the appointment..."
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Schedule Appointment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}