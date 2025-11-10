import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Checkbox } from './ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Calendar } from './ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Textarea } from './ui/textarea'
import { CalendarIcon, Printer, FileText, AlertTriangle } from 'lucide-react'
import { cn } from './ui/utils'
import { toast } from 'sonner'
import { listUsers, UserDTO } from '../lib/api.users'
import { listViolationsByStudent } from '../lib/api.violations'
import { listIncidents, IncidentDTO } from '../lib/api.incidents'
import { Alert, AlertDescription } from './ui/alert'

interface GoodMoralCertificateDialogProps {
  student: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GoodMoralCertificateDialog({ student, open, onOpenChange }: GoodMoralCertificateDialogProps) {
  const [includeLRN, setIncludeLRN] = useState(true)
  const [purpose, setPurpose] = useState('')
  const [dateGiven, setDateGiven] = useState<Date | undefined>(new Date())
  const [selectedSigner, setSelectedSigner] = useState('')
  const [hasUnresolvedIssues, setHasUnresolvedIssues] = useState(false)
  const [checkingIssues, setCheckingIssues] = useState(true)

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

  // Check for unresolved issues when dialog opens
  useEffect(() => {
    if (!open || !student?.id) {
      setHasUnresolvedIssues(false)
      setCheckingIssues(false)
      return
    }

    setCheckingIssues(true)
    ;(async () => {
      try {
        // Check for unresolved violations
        const violations = await listViolationsByStudent(Number(student.id))
        const unresolvedViolations = violations.filter(
          v => v.status !== 'Resolved' && v.status !== 'Appealed'
        )

        // Check for unresolved incidents (where student is the reporter)
        const allIncidents = await listIncidents()
        const studentLRN = student.lrn
        const unresolvedIncidents = allIncidents.filter(
          (inc: IncidentDTO) => {
            const isReporter = inc.reportedByLRN === studentLRN || 
                              inc.reportedBy?.toLowerCase().includes(student.firstName?.toLowerCase() || '') ||
                              inc.reportedBy?.toLowerCase().includes(student.lastName?.toLowerCase() || '')
            return isReporter && inc.status !== 'Resolved' && inc.status !== 'Dismissed'
          }
        )

        setHasUnresolvedIssues(unresolvedViolations.length > 0 || unresolvedIncidents.length > 0)
      } catch (error) {
        console.error('Error checking unresolved issues:', error)
        // On error, allow printing (fail open)
        setHasUnresolvedIssues(false)
      } finally {
        setCheckingIssues(false)
      }
    })()
  }, [open, student])

  // Auto-populate student data
  const studentFullName = student ? `${student.firstName} ${student.middleName || ''} ${student.lastName}`.replace(/\s+/g, ' ').trim() : ''
  const lrnText = student?.lrn || ''
  const gradeSection = student ? `Grade ${student.grade || student.gradeLevel || ''} - ${student.section || ''}`.trim() : ''
  const schoolYear = student?.schoolForm?.schoolYear || student?.schoolYear || ''
  const trackStrand = student?.schoolForm?.trackStrand || student?.trackStrand || ''
  
  // Extract specialization from track/strand
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

  // Format date to "17th of October 2025" format
  const formatDateGiven = (date: Date | undefined) => {
    if (!date) return ''
    
    const day = date.getDate()
    const month = date.toLocaleDateString('en-US', { month: 'long' })
    const year = date.getFullYear()
    
    const getDaySuffix = (day: number) => {
      if (day >= 11 && day <= 13) return 'th'
      switch (day % 10) {
        case 1: return 'st'
        case 2: return 'nd'
        case 3: return 'rd'
        default: return 'th'
      }
    }
    
    return `${day}${getDaySuffix(day)} of ${month} ${year}`
  }

  const handlePrint = async () => {
    const lrnSection = includeLRN ? `, bearing LRN ${lrnText},` : ''
    const formattedDate = formatDateGiven(dateGiven)
    const signer = adminUsers.find(u => (u as any).email === selectedSigner)
    const signerName = signer ? `${(signer as any).firstName} ${(signer as any).lastName}` : ''
    const signerPosition = signer ? formatPositionLabel(signer) : ''

    try {
      // Use the exact same logic as DOCX export
      const PizZip = (await import('pizzip')).default
      const Docxtemplater = (await import('docxtemplater')).default

      const templateUrl = new URL('../templates/binary/good_moral_template.zip', import.meta.url)
      const response = await fetch(templateUrl)
      if (!response.ok) {
        throw new Error('Binary template not found. Ensure good_moral_template.zip exists under src/templates/binary')
      }
      const templateBuffer = await response.arrayBuffer()

      const zip = new PizZip(templateBuffer)
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '${', end: '}' },
      })

      // Render with the same data as export
      doc.render({
        studentName: studentFullName,
        withLRN: lrnSection,
        schoolYear: schoolYear,
        trackAndStrand: trackStrand,
        specialization: specialization,
        purpose: purpose,
        formatDateGiven: formattedDate,
        certificateSigner: signerName,
        signerPosition: signerPosition,
      })

      // Generate the DOCX blob (same as export)
      const docxBlob = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })

      // Convert blob to array buffer for Electron IPC
      const arrayBuffer = await docxBlob.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      const buffer = Array.from(uint8Array)
      
      const filename = `Good_Moral_Certificate_${studentFullName.replace(/\s+/g, '_')}.docx`

      // Check if we're in Electron environment
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        // Use Electron IPC to save and print
        const result = await (window as any).electronAPI.saveAndPrintDocx({
          buffer: buffer,
          filename: filename
        })
        
        if (result.success) {
          toast.success('Certificate saved and opened for printing.')
        } else {
          toast.error('Failed to save certificate. ' + (result.error || ''))
        }
      } else {
        // Fallback: convert to HTML and print in browser
        const mammoth = await import('mammoth')
        const result = await mammoth.default.convertToHtml(
          { arrayBuffer },
          {
            styleMap: [
              "p[style-name='Heading 1'] => h1:fresh",
              "p[style-name='Heading 2'] => h2:fresh",
            ],
            convertImage: mammoth.default.images.imgElement(async (image) => {
              try {
                const imageBuffer = await image.read()
                const uint8Array = new Uint8Array(imageBuffer)
                let binary = ''
                for (let i = 0; i < uint8Array.length; i++) {
                  binary += String.fromCharCode(uint8Array[i])
                }
                const base64 = btoa(binary)
                const mimeType = image.contentType || 'image/png'
                return { src: `data:${mimeType};base64,${base64}` }
              } catch (err) {
                console.warn('Error converting image:', err)
                return { src: '' }
              }
            })
          }
        )

        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Certificate of Good Moral Character - Print</title>
                <style>
                  @page { margin: 1in; size: letter; }
                  body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.8; padding: 40px; max-width: 8.5in; margin: 0 auto; }
                  img { max-width: 100%; height: auto; }
                  @media print { body { padding: 0; } }
                </style>
              </head>
              <body>${result.value}</body>
            </html>
          `)
          printWindow.document.close()
          setTimeout(() => {
            printWindow.print()
          }, 250)
        }
        toast.success('Opening print dialog...')
      }
    } catch (error) {
      console.error('Error generating certificate for printing:', error)
      toast.error('Failed to generate certificate. Please try exporting as DOCX instead.')
    }
  }

  const handleExportDocx = async () => {
    const lrnSection = includeLRN ? `, bearing LRN ${lrnText},` : ''
    const formattedDate = formatDateGiven(dateGiven)
    const signer = adminUsers.find(u => (u as any).email === selectedSigner)
    const signerName = signer ? `${(signer as any).firstName} ${(signer as any).lastName}` : ''
    const signerPosition = signer ? formatPositionLabel(signer) : ''

    try {
      const PizZip = (await import('pizzip')).default
      const Docxtemplater = (await import('docxtemplater')).default

      const templateUrl = new URL('../templates/binary/good_moral_template.zip', import.meta.url)
      const response = await fetch(templateUrl)
      if (!response.ok) {
        throw new Error('Binary template not found. Ensure good_moral_template.zip exists under src/templates/binary')
      }
      const templateBuffer = await response.arrayBuffer()

      const zip = new PizZip(templateBuffer)
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '${', end: '}' },
      })

      doc.render({
        studentName: studentFullName,
        withLRN: lrnSection,
        schoolYear: schoolYear,
        trackAndStrand: trackStrand,
        specialization: specialization,
        purpose: purpose,
        formatDateGiven: formattedDate,
        certificateSigner: signerName,
        signerPosition: signerPosition,
      })

      const blob = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Good_Moral_Certificate_${studentFullName.replace(/\s+/g, '_')}.docx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Certificate exported as DOCX successfully!')
    } catch (error) {
      console.error('Error exporting DOCX:', error)
      toast.error('Failed to export DOCX. Please ensure the binary template exists and placeholders match.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Certificate of Good Moral Character</DialogTitle>
          <DialogDescription>
            Generate and print a good moral certificate for {studentFullName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Auto-populated fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Student Full Name</Label>
                <Input value={studentFullName} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  LRN
                  <div className="flex items-center gap-2 ml-auto">
                    <Checkbox 
                      id="includeLRN" 
                      checked={includeLRN}
                      onCheckedChange={(checked) => setIncludeLRN(checked as boolean)}
                    />
                    <label htmlFor="includeLRN" className="text-sm font-normal cursor-pointer">
                      Include in certificate
                    </label>
                  </div>
                </Label>
                <Input value={lrnText} readOnly className="bg-muted" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Grade & Section</Label>
                <Input value={gradeSection} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>School Year</Label>
                <Input value={schoolYear} readOnly className="bg-muted" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Track & Strand</Label>
                <Input value={trackStrand} readOnly className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Specialization</Label>
                <Input value={specialization} readOnly className="bg-muted" />
              </div>
            </div>
          </div>

          {/* Purpose field */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose of Certificate *</Label>
            <Textarea
              id="purpose"
              placeholder="Enter the purpose (e.g., job application, scholarship, transfer credentials)"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={3}
            />
          </div>

          {/* Date to be given */}
          <div className="space-y-2">
            <Label>Date to be Given *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left",
                    !dateGiven && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateGiven ? formatDateGiven(dateGiven) : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateGiven}
                  onSelect={setDateGiven}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Certificate signer */}
          <div className="space-y-2">
            <Label htmlFor="signer">Certificate Signer *</Label>
            <Select value={selectedSigner} onValueChange={setSelectedSigner}>
              <SelectTrigger id="signer">
                <SelectValue placeholder="Select authorized signer" />
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

          {/* Unresolved Issues Warning */}
          {hasUnresolvedIssues && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This student has unresolved violations or incidents. A Certificate of Good Moral Character cannot be issued until all issues are resolved.
              </AlertDescription>
            </Alert>
          )}

          {checkingIssues && (
            <Alert>
              <AlertDescription>
                Checking for unresolved issues...
              </AlertDescription>
            </Alert>
          )}

          {/* Preview section */}
          <div className="border rounded-md p-6 bg-muted/30 space-y-3">
            <h4 className="text-center font-medium">Certificate Preview</h4>
            <div className="text-sm space-y-2 whitespace-pre-wrap">
              <p className="text-center font-medium">TO WHOM IT MAY CONCERN:</p>
              <p className="text-justify">
                This is to certify that <strong>{studentFullName}</strong>
                {includeLRN && `, bearing LRN ${lrnText},`} is currently enrolled for the school year <strong>{schoolYear}</strong> in this learning institution, as per records on file in this office under <strong>{trackStrand}</strong> specialized in <strong>{specialization}</strong>.
              </p>
              <p className="text-justify">
                This further certifies that he/she was a person of good character, and he/she has not violated any of the school rules and regulations. He/she was also cleared of all property responsibility and can get along well with others.
              </p>
              <p className="text-justify">
                This certification is being issued upon the request of above-mentioned student for <strong>{purpose || '[purpose not specified]'}</strong>.
              </p>
              <p className="text-justify">
                Given this <strong>{dateGiven ? formatDateGiven(dateGiven) : '[date not selected]'}</strong> at Luis Y. Ferrer Jr Senior High School.
              </p>
              {selectedSigner && (
                <div className="pt-8 text-center">
                  <p className="font-medium">
                    {adminUsers.find(u => u.email === selectedSigner)?.firstName} {adminUsers.find(u => u.email === selectedSigner)?.lastName}
                  </p>
                  <p className="text-xs">
                    {formatPositionLabel(adminUsers.find(u => u.email === selectedSigner))}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={handlePrint}
              disabled={!purpose || !dateGiven || !selectedSigner || hasUnresolvedIssues || checkingIssues}
            >
              <Printer className="h-4 w-4" />
              Print Certificate
            </Button>
            <Button 
              className="flex-1 gap-2"
              onClick={handleExportDocx}
              disabled={!purpose || !dateGiven || !selectedSigner || hasUnresolvedIssues || checkingIssues}
            >
              <FileText className="h-4 w-4" />
              Export as DOCX
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
