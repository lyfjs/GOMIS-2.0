import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Calendar } from './ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Textarea } from './ui/textarea'
import { CalendarIcon, Printer, FileText } from 'lucide-react'
import { cn } from './ui/utils'
import { toast } from 'sonner@2.0.3'
import { listUsers, UserDTO } from '../lib/api.users'
import { listStudents } from '../lib/api.students'

interface DroppingFormDialogProps {
  student: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onStudentDrop: (droppedStudent: any) => void
}

export function DroppingFormDialog({ student, open, onOpenChange, onStudentDrop }: DroppingFormDialogProps) {
  const [formDate, setFormDate] = useState<Date | undefined>(new Date())
  const [inclusiveStartDate, setInclusiveStartDate] = useState<Date | undefined>()
  const [inclusiveEndDate, setInclusiveEndDate] = useState<Date | undefined>()
  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>(new Date())
  const [schoolYear, setSchoolYear] = useState('')
  const [semester, setSemester] = useState('')
  const [adviser, setAdviser] = useState('')
  const [actionTaken, setActionTaken] = useState('')
  const [reasonForDropping, setReasonForDropping] = useState('')
  const [selectedSigner, setSelectedSigner] = useState('')
  const [controlNumber, setControlNumber] = useState('')

  const [adminUsers, setAdminUsers] = useState<UserDTO[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const users = await listUsers()
        const admins = (users || []).filter(u => u.role && u.role !== 'STAFF')
        setAdminUsers(admins as any)
        const current = localStorage.getItem('gomis_current_user')
        if (current) {
          const cu = JSON.parse(current)
          if (cu?.email) setSelectedSigner(cu.email)
        }
      } catch {
        setAdminUsers([])
      }
    })()
  }, [open])

  // Generate control number when dialog opens
  useEffect(() => {
    if (!open) return

    ;(async () => {
      try {
        // Get current date in mm-dd-yy format
        const now = new Date()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const year = String(now.getFullYear()).slice(-2)
        const datePart = `${month}-${day}-${year}`

        // Count dropped students
        const allStudents = await listStudents()
        const droppedCount = allStudents.filter((s: any) => 
          s.status === 'Dropped' || s.status === 'DROPPED'
        ).length

        // Generate control number: mm-dd-yy-XX (where XX is droppedCount + 1, padded to 2 digits)
        const sequenceNumber = String(droppedCount + 1).padStart(2, '0')
        const controlNum = `${datePart}-${sequenceNumber}`
        setControlNumber(controlNum)
      } catch (error) {
        console.error('Error generating control number:', error)
        // Fallback: use current date and time-based number
        const now = new Date()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const year = String(now.getFullYear()).slice(-2)
        const timeBased = String(Math.floor(Date.now() / 1000) % 100).padStart(2, '0')
        setControlNumber(`${month}-${day}-${year}-${timeBased}`)
      }
    })()
  }, [open])

  // Auto-populate student data
  const studentFullName = student ? `${student.firstName} ${student.middleName || ''} ${student.lastName}`.replace(/\s+/g, ' ').trim() : ''
  const trackStrand = student?.schoolForm?.trackStrand || student?.trackStrand || ''
  const gradeSection = student ? `Grade ${student.grade || student.gradeLevel || ''} - ${student.section || ''}`.trim() : ''
  
  // Extract specialization
  const getSpecialization = () => {
    if (!trackStrand) return ''
    const trackMap: { [key: string]: string } = {
      'ABM': 'Accountancy, Business and Management',
      'STEM': 'Science, Technology, Engineering and Mathematics',
      'HUMSS': 'Humanities and Social Sciences',
      'GAS': 'General Academic Strand',
      'TVL': 'Technical-Vocational-Livelihood'
    }
    return trackMap[trackStrand] || trackStrand
  }

  const specialization = getSpecialization()

  // Format date to MM/DD/YYYY
  const formatDate = (date: Date | undefined) => {
    if (!date) return ''
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()
    return `${month}/${day}/${year}`
  }

  // Format inclusive dates
  const formatInclusiveDates = () => {
    if (!inclusiveStartDate && !inclusiveEndDate) return ''
    const start = formatDate(inclusiveStartDate)
    const end = formatDate(inclusiveEndDate)
    if (start && end) return `${start} - ${end}`
    if (start) return start
    if (end) return end
    return ''
  }

  // Format position/specialization for display
  const formatPositionLabel = (user: any) => {
    const position = user?.position || user?.workPosition || ''
    const spec = user?.specialization || ''
    
    const formatText = (text: string) => {
      return text
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }
    
    const formattedPosition = formatText(position)
    const formattedSpec = formatText(spec)
    
    if (formattedPosition && formattedSpec) {
      return `${formattedPosition} • ${formattedSpec}`
    }
    return formattedPosition || formattedSpec
  }

  const handlePrint = async () => {
    const signer = adminUsers.find(u => u.email === selectedSigner)
    const signerName = signer ? `${signer.firstName} ${signer.lastName}` : ''

    try {
      // Use the same logic as DOCX export, then print
      const PizZip = (await import('pizzip')).default
      const Docxtemplater = (await import('docxtemplater')).default

      const templateUrl = new URL('../templates/binary/dropping_form_template.zip', import.meta.url)
      const response = await fetch(templateUrl)
      if (!response.ok) {
        throw new Error('Binary template not found. Ensure dropping_form_template.zip exists under src/templates/binary')
      }
      const templateBuffer = await response.arrayBuffer()

      const zip = new PizZip(templateBuffer)
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '${', end: '}' },
      })

      // Render with data
      doc.render({
        ControlNumber: controlNumber,
        Date: formatDate(formDate),
        Name: studentFullName,
        TrackNStrand: trackStrand,
        Specialization: specialization,
        Adviser: adviser,
        GradeNSection: gradeSection,
        Inclusive: formatInclusiveDates(),
        ActionTaken: actionTaken,
        ReasonForDropping: reasonForDropping,
        EffectiveDate: formatDate(effectiveDate),
        UserAccount: signerName,
      })

      // Generate the DOCX blob
      const docxBlob = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })

      // Convert blob to array buffer for Electron IPC
      const arrayBuffer = await docxBlob.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      const buffer = Array.from(uint8Array)
      
      const filename = `Dropping_Form_${studentFullName.replace(/\s+/g, '_')}.docx`

      // Check if we're in Electron environment
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        // Use Electron IPC to save and print
        const result = await (window as any).electronAPI.saveAndPrintDocx({
          buffer: buffer,
          filename: filename
        })
        
        if (result.success) {
          toast.success('Dropping form saved and sent to printer.')
        } else {
          toast.error('Failed to print dropping form. ' + (result.error || ''))
        }
      } else {
        // Fallback: download the file
        const url = window.URL.createObjectURL(docxBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        toast.success('Dropping form downloaded. Please open and print manually.')
      }
    } catch (error) {
      console.error('Error generating dropping form for printing:', error)
      toast.error('Failed to generate dropping form. Please try exporting as DOCX instead.')
    }
  }

  const handleExportDocx = async () => {
    const signer = adminUsers.find(u => u.email === selectedSigner)
    const signerName = signer ? `${signer.firstName} ${signer.lastName}` : ''

    try {
      const PizZip = (await import('pizzip')).default
      const Docxtemplater = (await import('docxtemplater')).default

      const templateUrl = new URL('../templates/binary/dropping_form_template.zip', import.meta.url)
      const response = await fetch(templateUrl)
      if (!response.ok) {
        throw new Error('Binary template not found. Ensure dropping_form_template.zip exists under src/templates/binary')
      }
      const templateBuffer = await response.arrayBuffer()

      const zip = new PizZip(templateBuffer)
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '${', end: '}' },
      })

      // Render with data (v4 API) – match case-sensitive keys in template
      doc.render({
        ControlNumber: controlNumber,
        Date: formatDate(formDate),
        Name: studentFullName,
        TrackNStrand: trackStrand,
        Specialization: specialization,
        Adviser: adviser,
        GradeNSection: gradeSection,
        Inclusive: formatInclusiveDates(),
        ActionTaken: actionTaken,
        ReasonForDropping: reasonForDropping,
        EffectiveDate: formatDate(effectiveDate),
        UserAccount: signerName,
      })

      const blob = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Dropping_Form_${studentFullName.replace(/\s+/g, '_')}.docx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Dropping form exported as DOCX successfully!')
    } catch (error) {
      console.error('Error exporting DOCX:', error)
      toast.error('Failed to export DOCX. Please ensure the binary template exists and placeholders match.')
    }
  }

  const handleSubmit = async () => {
    try {
      // Update student status to DROPPED and save control number
      const { updateStudent, getStudent } = await import('../lib/api.students')
      await updateStudent(Number(student.id), {
        status: 'DROPPED',
        controlNumber: controlNumber,
      })
      
      // Fetch the updated student from backend to get the saved control number
      const updatedStudent = await getStudent(Number(student.id))
      
    // Mark student as dropped
    const droppedStudent = {
        ...updatedStudent,
        status: 'DROPPED',
        controlNumber: updatedStudent.controlNumber || controlNumber,
      droppedDate: effectiveDate?.toISOString(),
      droppingReason: reasonForDropping,
      droppingDetails: {
        formDate: formDate?.toISOString(),
        schoolYear,
        semester,
        adviser,
        inclusiveStartDate: inclusiveStartDate?.toISOString(),
        inclusiveEndDate: inclusiveEndDate?.toISOString(),
        actionTaken,
        reasonForDropping,
        effectiveDate: effectiveDate?.toISOString(),
          processedBy: selectedSigner,
          controlNumber: updatedStudent.controlNumber || controlNumber
      }
    }
    
    onStudentDrop(droppedStudent)
      // Emit event to refresh student list
      const { emit } = await import('../lib/events')
      emit('data:students')
    toast.success('Student marked as dropped')
    onOpenChange(false)
    } catch (error) {
      console.error('Error dropping student:', error)
      toast.error('Failed to update student status')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dropping Form</DialogTitle>
          <DialogDescription>
            Complete the dropping form for {studentFullName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Form Header */}
          <div className="space-y-4 pb-4 border-b">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Control Number</Label>
                <Input value={controlNumber} readOnly className="bg-muted font-mono" />
              </div>
              <div className="space-y-2">
                <Label>Form Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left",
                        !formDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formDate ? formatDate(formDate) : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formDate}
                      onSelect={setFormDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schoolYear">School Year *</Label>
                <Input
                  id="schoolYear"
                  placeholder="20__-20__"
                  value={schoolYear}
                  onChange={(e) => setSchoolYear(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semester *</Label>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger id="semester">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st Semester">1st Semester</SelectItem>
                    <SelectItem value="2nd Semester">2nd Semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Student Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Student Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Student Name</Label>
                <Input value={studentFullName} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Grade & Section</Label>
                <Input value={gradeSection} readOnly className="bg-muted" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Track/Strand</Label>
                <Input value={trackStrand} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Specialization</Label>
                <Input value={specialization} readOnly className="bg-muted" />
              </div>
            </div>
          </div>

          {/* Adviser */}
          <div className="space-y-2">
            <Label htmlFor="adviser">Adviser *</Label>
            <Input
              id="adviser"
              placeholder="Enter adviser name"
              value={adviser}
              onChange={(e) => setAdviser(e.target.value)}
            />
          </div>

          {/* Inclusive Date of Absences */}
          <div className="space-y-2">
            <Label>Inclusive Date of Absences</Label>
            <div className="grid grid-cols-2 gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left",
                      !inclusiveStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {inclusiveStartDate ? formatDate(inclusiveStartDate) : 'Start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={inclusiveStartDate}
                    onSelect={setInclusiveStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left",
                      !inclusiveEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {inclusiveEndDate ? formatDate(inclusiveEndDate) : 'End date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={inclusiveEndDate}
                    onSelect={setInclusiveEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Action Taken */}
          <div className="space-y-2">
            <Label htmlFor="actionTaken">Action Taken *</Label>
            <Textarea
              id="actionTaken"
              placeholder="Describe actions taken (e.g., counseling sessions, parent meetings)"
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              rows={3}
            />
          </div>

          {/* Reason for Dropping */}
          <div className="space-y-2">
            <Label htmlFor="reasonForDropping">Reason for Dropping *</Label>
            <Textarea
              id="reasonForDropping"
              placeholder="Enter reason for dropping"
              value={reasonForDropping}
              onChange={(e) => setReasonForDropping(e.target.value)}
              rows={3}
            />
          </div>

          {/* Effective Date */}
          <div className="space-y-2">
            <Label>Effective Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left",
                    !effectiveDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {effectiveDate ? formatDate(effectiveDate) : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={effectiveDate}
                  onSelect={setEffectiveDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Guidance Designate */}
          <div className="space-y-2">
            <Label htmlFor="signer">Guidance Designate *</Label>
            <Select value={selectedSigner} onValueChange={setSelectedSigner}>
              <SelectTrigger id="signer">
                <SelectValue placeholder="Select guidance designate" />
              </SelectTrigger>
              <SelectContent>
                {adminUsers.length > 0 ? (
                  adminUsers.map((admin) => (
                    <SelectItem key={admin.email} value={admin.email}>
                      {admin.firstName} {admin.lastName} - {formatPositionLabel(admin)}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No admin users registered
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={handlePrint}
              disabled={!schoolYear || !semester || !adviser || !actionTaken || !reasonForDropping || !effectiveDate || !selectedSigner}
            >
              <Printer className="h-4 w-4" />
              Print Form
            </Button>
            <Button 
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleExportDocx}
              disabled={!schoolYear || !semester || !adviser || !actionTaken || !reasonForDropping || !effectiveDate || !selectedSigner}
            >
              <FileText className="h-4 w-4" />
              Export as DOCX
            </Button>
            <Button 
              className="flex-1"
              onClick={handleSubmit}
              disabled={!schoolYear || !semester || !adviser || !actionTaken || !reasonForDropping || !effectiveDate || !selectedSigner}
            >
              Submit & Drop Student
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
