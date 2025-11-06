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
import { CalendarIcon, Printer, FileText } from 'lucide-react'
import { cn } from './ui/utils'
import { toast } from 'sonner'
import { listUsers, UserDTO } from '../lib/api.users'

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

  const handlePrint = () => {
    const lrnSection = includeLRN ? `, bearing LRN ${lrnText},` : ''
    const formattedDate = formatDateGiven(dateGiven)
    const signer = adminUsers.find(u => (u as any).email === selectedSigner)
    const signerName = signer ? `${(signer as any).firstName} ${(signer as any).lastName}` : ''
    const signerPosition = signer ? formatPositionLabel(signer) : ''

    const certificateContent = `
TO WHOM IT MAY CONCERN:

This is to certify that ${studentFullName}${lrnSection} is currently enrolled for the school year ${schoolYear} in this learning institution, as per records on file in this office under ${trackStrand} specialized in ${specialization}.

This further certifies that he/she was a person of good character, and he/she has not violated any of the school rules and regulations. He/she was also cleared of all property responsibility and can get along well with others.

This certification is being issued upon the request of above-mentioned student for ${purpose}.

Given this ${formattedDate} at Luis Y. Ferrer Jr Senior High School.



${signerName}
${signerPosition}
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Certificate of Good Moral Character</title>
            <style>
              @page { margin: 1in; }
              body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.8; padding: 40px; }
              .certificate { white-space: pre-wrap; }
              @media print { button { display: none; } }
            </style>
          </head>
          <body>
            <div class="certificate">${certificateContent}</div>
            <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px;">Print</button>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
    
    toast.success('Opening print preview...')
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
              disabled={!purpose || !dateGiven || !selectedSigner}
            >
              <Printer className="h-4 w-4" />
              Print Certificate
            </Button>
            <Button 
              className="flex-1 gap-2"
              onClick={handleExportDocx}
              disabled={!purpose || !dateGiven || !selectedSigner}
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
