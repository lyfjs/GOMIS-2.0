import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Calendar } from './ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { CalendarIcon, Trash2, FileText, UserX } from 'lucide-react'
import { cn } from './ui/utils'
import { toast } from 'sonner'
import { updateStudent, deleteStudent as apiDeleteStudent, StudentDTO } from '../lib/api.students'
import { GoodMoralCertificateDialog } from './good-moral-certificate-dialog'
import { DroppingFormDialog } from './dropping-form-dialog'
import { listViolationsByStudent } from '../lib/api.violations'
import { listIncidents, IncidentDTO } from '../lib/api.incidents'
import { Alert, AlertDescription } from './ui/alert'
import { AlertTriangle } from 'lucide-react'

interface EditStudentDialogProps {
  student: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onStudentUpdate: (updatedStudent: any) => void
  onStudentDelete: () => void
}

export function EditStudentDialog({ student, open, onOpenChange, onStudentUpdate, onStudentDelete }: EditStudentDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showDroppingFormDialog, setShowDroppingFormDialog] = useState(false)
  const [showGoodMoralDialog, setShowGoodMoralDialog] = useState(false)
  const [hasUnresolvedIssues, setHasUnresolvedIssues] = useState(false)
  const [checkingIssues, setCheckingIssues] = useState(true)
  const [birthDate, setBirthDate] = useState<Date | undefined>()
  const [formData, setFormData] = useState({
    // Student Information
    lrn: '',
    sex: '',
    lastName: '',
    firstName: '',
    middleName: '',
    age: '',
    motherTongue: '',
    ipEthnicGroup: '',
    religion: '',
    // Residential Address
    houseNumber: '',
    streetName: '',
    barangay: '',
    municipality: '',
    province: '',
    // Parents Information
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    motherOccupation: '',
    // Guardian Information
    guardianName: '',
    guardianRelationship: '',
    guardianContact: '',
    // School Form
    semester: '',
    gradeLevel: '',
    section: '',
    trackStrand: '',
    schoolYear: '',
  })

  // Initialize form with student data when dialog opens
  useEffect(() => {
    if (open && student) {
      setFormData({
        lrn: student.lrn || '',
        sex: student.sex || '',
        lastName: student.lastName || '',
        firstName: student.firstName || '',
        middleName: student.middleName || '',
        age: student.age || '',
        motherTongue: student.motherTongue || '',
        ipEthnicGroup: student.ipEthnicGroup || '',
        religion: student.religion || '',
        houseNumber: student.houseNumber || '',
        streetName: student.streetName || '',
        barangay: student.barangay || '',
        municipality: student.municipality || '',
        province: student.province || '',
        fatherName: student.fatherName || '',
        fatherOccupation: student.fatherOccupation || '',
        motherName: student.motherName || '',
        motherOccupation: student.motherOccupation || '',
        guardianName: student.guardianName || '',
        guardianRelationship: student.guardianRelationship || '',
        guardianContact: student.guardianContact || '',
        semester: student.semester || student.schoolForm?.semester || '',
        gradeLevel: student.grade || student.gradeLevel || '',
        section: student.section || '',
        trackStrand: student.schoolForm?.trackStrand || student.trackStrand || '',
        schoolYear: student.schoolForm?.schoolYear || student.schoolYear || '',
      })
      if (student.birthDate) {
        setBirthDate(new Date(student.birthDate))
      }
    }
  }, [open, student])

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-calculate age when birth date changes
    if (field === 'birthDate' && birthDate) {
      const today = new Date()
      const birth = new Date(birthDate)
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }
      setFormData(prev => ({ ...prev, age: age.toString() }))
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setBirthDate(date)
    if (date) {
      const today = new Date()
      let age = today.getFullYear() - date.getFullYear()
      const monthDiff = today.getMonth() - date.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
        age--
      }
      setFormData(prev => ({ ...prev, age: age.toString() }))
    }
  }

  const handleReset = () => {
    // Reset to original student data
    if (student) {
      setFormData({
        lrn: student.lrn || '',
        sex: student.sex || '',
        lastName: student.lastName || '',
        firstName: student.firstName || '',
        middleName: student.middleName || '',
        age: student.age || '',
        motherTongue: student.motherTongue || '',
        ipEthnicGroup: student.ipEthnicGroup || '',
        religion: student.religion || '',
        houseNumber: student.houseNumber || '',
        streetName: student.streetName || '',
        barangay: student.barangay || '',
        municipality: student.municipality || '',
        province: student.province || '',
        fatherName: student.fatherName || '',
        fatherOccupation: student.fatherOccupation || '',
        motherName: student.motherName || '',
        motherOccupation: student.motherOccupation || '',
        guardianName: student.guardianName || '',
        guardianRelationship: student.guardianRelationship || '',
        guardianContact: student.guardianContact || '',
        semester: student.semester || student.schoolForm?.semester || '',
        gradeLevel: student.grade || student.gradeLevel || '',
        section: student.section || '',
        trackStrand: student.schoolForm?.trackStrand || student.trackStrand || '',
        schoolYear: student.schoolForm?.schoolYear || student.schoolYear || '',
      })
      if (student.birthDate) {
        setBirthDate(new Date(student.birthDate))
      }
    }
    setShowResetConfirm(false)
  }

  const handleResetClick = () => {
    setShowResetConfirm(true)
  }

  const handleSubmit = async () => {
    try {
      const yyyyMmDd = birthDate ? `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2,'0')}-${String(birthDate.getDate()).padStart(2,'0')}` : undefined
      const payload: any = {
        lrn: formData.lrn,
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || undefined,
        birthDate: yyyyMmDd,
        motherTongue: formData.motherTongue || undefined,
        ipEthnicGroup: formData.ipEthnicGroup || undefined,
        religion: formData.religion || undefined,
        gradeLevel: formData.gradeLevel,
        section: formData.section,
        trackStrand: formData.trackStrand,
        specialization: student.specialization || undefined,
        semester: formData.semester || undefined,
        schoolYear: formData.schoolYear || undefined,
      }
      const updated: StudentDTO | null = await updateStudent(Number(student.id), payload)
      if (updated) {
        onStudentUpdate(updated)
        toast.success('Student information updated successfully')
        onOpenChange(false)
      } else {
        toast.error('Student not found')
      }
    } catch {
      toast.error('Failed to update student')
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await apiDeleteStudent(Number(student.id))
      onStudentDelete()
      toast.success('Student record deleted successfully')
      setShowDeleteConfirm(false)
      onOpenChange(false)
    } catch {
      toast.error('Failed to delete student')
    }
  }

  const handleDropClick = () => {
    setShowDroppingFormDialog(true)
  }

  const handleStudentDrop = async (droppedStudent: any) => {
    // Refresh the student data from backend to ensure control number is included
    try {
      const { getStudent } = await import('../lib/api.students')
      const refreshed = await getStudent(Number(student.id))
      onStudentUpdate(refreshed || droppedStudent)
    } catch {
      onStudentUpdate(droppedStudent)
    }
  }

  const handlePrintGoodMoral = () => {
    setShowGoodMoralDialog(true)
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Select birth date'
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[94vw] max-w-[1400px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student Information</DialogTitle>
            <DialogDescription>
              Update student information or delete this record
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="student-info" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="student-info">Student Info</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="parents">Parents</TabsTrigger>
              <TabsTrigger value="guardian">Guardian</TabsTrigger>
              <TabsTrigger value="school-form">School Form</TabsTrigger>
            </TabsList>

            <TabsContent value="student-info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Student Information</CardTitle>
                  <CardDescription>Basic student details and personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lrn">LRN (12-digit) *</Label>
                      <Input
                        id="lrn"
                        placeholder="Enter 12-digit LRN"
                        maxLength={12}
                        value={formData.lrn}
                        onChange={(e) => handleInputChange('lrn', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sex">Sex *</Label>
                      <Select value={formData.sex} onValueChange={(value) => handleInputChange('sex', value)}>
                        <SelectTrigger id="sex">
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter last name"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter first name"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="middleName">Middle Name</Label>
                      <Input
                        id="middleName"
                        placeholder="Enter middle name"
                        value={formData.middleName}
                        onChange={(e) => handleInputChange('middleName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Birth Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left",
                              !birthDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formatDate(birthDate)}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={birthDate}
                            onSelect={handleDateSelect}
                            fromYear={1950}
                            toYear={new Date().getFullYear()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        placeholder="Auto-calculated"
                        value={formData.age}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="motherTongue">Mother Tongue</Label>
                      <Input
                        id="motherTongue"
                        placeholder="Enter mother tongue"
                        value={formData.motherTongue}
                        onChange={(e) => handleInputChange('motherTongue', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ipEthnicGroup">IP/Ethnic Group</Label>
                      <Input
                        id="ipEthnicGroup"
                        placeholder="Enter IP/Ethnic group"
                        value={formData.ipEthnicGroup}
                        onChange={(e) => handleInputChange('ipEthnicGroup', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="religion">Religion</Label>
                      <Input
                        id="religion"
                        placeholder="Enter religion"
                        value={formData.religion}
                        onChange={(e) => handleInputChange('religion', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="address" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Residential Address</CardTitle>
                  <CardDescription>Optional address information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="houseNumber">House Number</Label>
                      <Input
                        id="houseNumber"
                        placeholder="Enter house number"
                        value={formData.houseNumber}
                        onChange={(e) => handleInputChange('houseNumber', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="streetName">Street Name</Label>
                      <Input
                        id="streetName"
                        placeholder="Enter street name"
                        value={formData.streetName}
                        onChange={(e) => handleInputChange('streetName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="barangay">Barangay</Label>
                      <Input
                        id="barangay"
                        placeholder="Enter barangay"
                        value={formData.barangay}
                        onChange={(e) => handleInputChange('barangay', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="municipality">Municipality/City</Label>
                      <Input
                        id="municipality"
                        placeholder="Enter municipality/city"
                        value={formData.municipality}
                        onChange={(e) => handleInputChange('municipality', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="province">Province</Label>
                      <Input
                        id="province"
                        placeholder="Enter province"
                        value={formData.province}
                        onChange={(e) => handleInputChange('province', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="parents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Parents Information</CardTitle>
                  <CardDescription>Optional parent details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fatherName">Father's Name</Label>
                      <Input
                        id="fatherName"
                        placeholder="Enter father's name"
                        value={formData.fatherName}
                        onChange={(e) => handleInputChange('fatherName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fatherOccupation">Father's Occupation</Label>
                      <Input
                        id="fatherOccupation"
                        placeholder="Enter father's occupation"
                        value={formData.fatherOccupation}
                        onChange={(e) => handleInputChange('fatherOccupation', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="motherName">Mother's Name</Label>
                      <Input
                        id="motherName"
                        placeholder="Enter mother's name"
                        value={formData.motherName}
                        onChange={(e) => handleInputChange('motherName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="motherOccupation">Mother's Occupation</Label>
                      <Input
                        id="motherOccupation"
                        placeholder="Enter mother's occupation"
                        value={formData.motherOccupation}
                        onChange={(e) => handleInputChange('motherOccupation', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guardian" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Guardian's Information</CardTitle>
                  <CardDescription>Optional guardian details (if not living with parents)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="guardianName">Guardian's Name</Label>
                    <Input
                      id="guardianName"
                      placeholder="Enter guardian's name"
                      value={formData.guardianName}
                      onChange={(e) => handleInputChange('guardianName', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="guardianRelationship">Relationship</Label>
                      <Input
                        id="guardianRelationship"
                        placeholder="Enter relationship"
                        value={formData.guardianRelationship}
                        onChange={(e) => handleInputChange('guardianRelationship', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guardianContact">Contact Number</Label>
                      <Input
                        id="guardianContact"
                        placeholder="Enter contact number"
                        value={formData.guardianContact}
                        onChange={(e) => handleInputChange('guardianContact', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="school-form" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>School Form Information</CardTitle>
                  <CardDescription>School enrollment details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="semester">Semester</Label>
                      <Select value={formData.semester} onValueChange={(value) => handleInputChange('semester', value)}>
                        <SelectTrigger id="semester">
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st Semester">1st Semester</SelectItem>
                          <SelectItem value="2nd Semester">2nd Semester</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gradeLevel">Grade Level</Label>
                      <Select value={formData.gradeLevel} onValueChange={(value) => handleInputChange('gradeLevel', value)}>
                        <SelectTrigger id="gradeLevel">
                          <SelectValue placeholder="Select grade level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="11">Grade 11</SelectItem>
                          <SelectItem value="12">Grade 12</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="section">Section</Label>
                      <Input
                        id="section"
                        placeholder="Enter section"
                        value={formData.section}
                        onChange={(e) => handleInputChange('section', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trackStrand">Track/Strand</Label>
                      <Select value={formData.trackStrand} onValueChange={(value) => handleInputChange('trackStrand', value)}>
                        <SelectTrigger id="trackStrand">
                          <SelectValue placeholder="Select track/strand" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ABM">ABM - Accountancy, Business and Management</SelectItem>
                          <SelectItem value="STEM">STEM - Science, Technology, Engineering and Mathematics</SelectItem>
                          <SelectItem value="HUMSS">HUMSS - Humanities and Social Sciences</SelectItem>
                          <SelectItem value="GAS">GAS - General Academic Strand</SelectItem>
                          <SelectItem value="TVL">TVL - Technical-Vocational-Livelihood</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schoolYear">School Year</Label>
                    <Input
                      id="schoolYear"
                      placeholder="e.g., 2024-2025"
                      value={formData.schoolYear}
                      onChange={(e) => handleInputChange('schoolYear', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="space-y-4 pt-6 border-t">
            {/* Warning message at top center */}
            {hasUnresolvedIssues && (
              <div className="flex justify-center">
                <Alert variant="destructive" className="w-full max-w-2xl flex flex-col items-center justify-center text-center">
                  <div className="flex justify-center mb-2">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <AlertDescription className="text-center">
                    This student has unresolved violations or incidents. A Certificate of Good Moral Character cannot be issued until all issues are resolved.
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            {/* Action buttons row 1 */}
            <div className="flex gap-3">
              {!hasUnresolvedIssues && (
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2"
                  onClick={handlePrintGoodMoral}
                  disabled={checkingIssues}
                >
                  <FileText className="h-4 w-4" />
                  Print Good Moral
                </Button>
              )}
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={handleDropClick}
              >
                <UserX className="h-4 w-4" />
                Drop Student
              </Button>
            </div>
            
            {/* Action buttons row 2 */}
            <div className="flex justify-between items-center">
              <Button variant="destructive" onClick={handleDeleteClick} className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Student
              </Button>
              <div className="flex gap-4">
                <Button variant="outline" onClick={handleResetClick}>
                  Reset Changes
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.lrn || !formData.firstName || !formData.lastName || !formData.sex || !birthDate}
                >
                  Update Student
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              This will discard all changes you've made and restore the original student information. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this student record? This action cannot be undone and all student information will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dropping Form Dialog */}
      <DroppingFormDialog
        student={student}
        open={showDroppingFormDialog}
        onOpenChange={setShowDroppingFormDialog}
        onStudentDrop={handleStudentDrop}
      />

      {/* Good Moral Certificate Dialog */}
      <GoodMoralCertificateDialog
        student={student}
        open={showGoodMoralDialog}
        onOpenChange={setShowGoodMoralDialog}
      />
    </>
  )
}
