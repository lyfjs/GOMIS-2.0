import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog'
import { toast } from 'sonner'
import { updateAppointment, deleteAppointment } from '../lib/api.appointments'

interface EditAppointmentDialogProps {
  appointment: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onAppointmentUpdate: (appointment: any) => void
  onAppointmentCancel: (appointmentId: any) => void
}

export function EditAppointmentDialog({ 
  appointment, 
  open, 
  onOpenChange, 
  onAppointmentUpdate,
  onAppointmentCancel 
}: EditAppointmentDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    time: '',
    status: 'Scheduled'
  })
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  useEffect(() => {
    if (appointment) {
      setFormData({
        title: appointment.title || '',
        time: appointment.time || '',
        status: appointment.status || 'Scheduled'
      })
    }
  }, [appointment])

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.time) {
      toast.error('Please fill in all required fields')
      return
    }
    try {
      const updated = await updateAppointment(Number(appointment.id), {
        title: formData.title,
        time: formData.time,
        status: (formData.status?.toUpperCase?.() || 'SCHEDULED') as any,
      })
      onAppointmentUpdate(updated)
      onOpenChange(false)
    } catch {
      toast.error('Failed to update appointment')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleCancel = () => {
    setShowCancelDialog(true)
  }

  const confirmCancel = async () => {
    try {
      await deleteAppointment(Number(appointment.id))
      onAppointmentCancel(appointment.id)
      setShowCancelDialog(false)
      onOpenChange(false)
      toast.success('Appointment cancelled successfully')
    } catch {
      toast.error('Failed to cancel appointment')
    }
  }

  if (!appointment) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>
              Update appointment details or cancel the appointment.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input value={appointment.date} disabled />
            </div>

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
              <Label htmlFor="time">Time *</Label>
              <Select value={formData.time} onValueChange={(value) => handleSelectChange('time', value)} required>
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

            <div className="space-y-2">
              <Label>Consultation Type</Label>
              <Input value={appointment.consultationType} disabled />
            </div>

            <div className="space-y-2">
              <Label>Participant</Label>
              <Input value={appointment.participantName || 'N/A'} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="destructive" onClick={handleCancel}>
                Cancel Appointment
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel}>Yes, cancel appointment</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
