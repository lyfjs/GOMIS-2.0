import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Calendar } from './ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { CalendarIcon, Plus } from 'lucide-react'
import { cn } from './ui/utils'
import { toast } from 'sonner'
import { createStudent, StudentDTO } from '../lib/api.students'


interface CreateStudentDialogProps {
  onStudentAdd: (student: any) => void
}

export function CreateStudentDialog({ onStudentAdd }: CreateStudentDialogProps) {
  const [open, setOpen] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
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
    
    // Residential Address (Optional)
    houseNo: '',
    street: '',
    region: '',
    province: '',
    municipality: '',
    barangay: '',
    zipCode: '',
    
    // Parents Information (Optional)
    fatherLastName: '',
    fatherFirstName: '',
    fatherMiddleName: '',
    fatherContact: '',
    motherLastName: '',
    motherFirstName: '',
    motherMiddleName: '',
    motherContact: '',
    
    // Guardian's Information (Optional)
    guardianFullName: '',
    guardianRelation: '',
    guardianContact: '',
    
    // School Form Information
    schoolName: '',
    schoolId: '',
    schoolRegion: '',
    division: '',
    district: '',
    semester: '',
    schoolYear: '2024-2025',
    gradeLevel: '',
    section: '',
    trackStrand: '',
    course: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDateSelect = (date: Date | undefined) => {
    setBirthDate(date)
    if (date) {
      const today = new Date()
      const age = today.getFullYear() - date.getFullYear()
      const monthDiff = today.getMonth() - date.getMonth()
      const adjustedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate()) ? age - 1 : age
      setFormData(prev => ({
        ...prev,
        age: adjustedAge.toString()
      }))
    }
  }

  const handleSubmit = async () => {
    try {
      const genderMap: Record<string, any> = { Male: 'MALE', Female: 'FEMALE' }
      const yyyyMmDd = birthDate ? `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2,'0')}-${String(birthDate.getDate()).padStart(2,'0')}` : undefined

      const payload: any = {
        lrn: formData.lrn,
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || undefined,
        gender: genderMap[formData.sex] || 'OTHER',
        birthDate: yyyyMmDd,
        motherTongue: formData.motherTongue || undefined,
        ipEthnicGroup: formData.ipEthnicGroup || undefined,
        religion: formData.religion || undefined,
        houseNo: formData.houseNo || undefined,
        street: formData.street || undefined,
        region: formData.region || undefined,
        province: formData.province || undefined,
        municipality: formData.municipality || undefined,
        barangay: formData.barangay || undefined,
        zipCode: formData.zipCode || undefined,
        gradeLevel: formData.gradeLevel,
        section: formData.section,
        trackStrand: formData.trackStrand,
        specialization: formData.course || undefined,
        schoolName: formData.schoolName || undefined,
        schoolId: formData.schoolId || undefined,
        schoolRegion: formData.schoolRegion || undefined,
        division: formData.division || undefined,
        district: formData.district || undefined,
        semester: formData.semester || undefined,
        schoolYear: formData.schoolYear || undefined,
        fatherFirstName: formData.fatherFirstName || undefined,
        fatherMiddleName: formData.fatherMiddleName || undefined,
        fatherLastName: formData.fatherLastName || undefined,
        fatherContact: formData.fatherContact || undefined,
        motherFirstName: formData.motherFirstName || undefined,
        motherMiddleName: formData.motherMiddleName || undefined,
        motherLastName: formData.motherLastName || undefined,
        motherContact: formData.motherContact || undefined,
        guardianName: formData.guardianFullName || undefined,
        guardianRelation: formData.guardianRelation || undefined,
        guardianContact: formData.guardianContact || undefined,
      }

      const created: StudentDTO = await createStudent(payload)
      onStudentAdd(created)
      toast.success('Student created and saved to database')
      handleReset()
      setOpen(false)
    } catch (e: any) {
      toast.error('Failed to create student. Please verify required fields')
    }
  }

  const handleReset = () => {
    setFormData({
      lrn: '', sex: '', lastName: '', firstName: '', middleName: '', age: '',
      motherTongue: '', ipEthnicGroup: '', religion: '', houseNo: '', street: '',
      region: '', province: '', municipality: '', barangay: '', zipCode: '',
      fatherLastName: '', fatherFirstName: '', fatherMiddleName: '', fatherContact: '',
      motherLastName: '', motherFirstName: '', motherMiddleName: '', motherContact: '',
      guardianFullName: '', guardianRelation: '', guardianContact: '',
      schoolName: '', schoolId: '', schoolRegion: '', division: '', district: '',
      semester: '', schoolYear: '2024-2025', gradeLevel: '', section: '', trackStrand: '', course: ''
    })
    setBirthDate(undefined)
    setShowResetConfirm(false)
  }

  const handleResetClick = () => {
    setShowResetConfirm(true)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Student
        </Button>
      </DialogTrigger>
      <DialogContent className="!max-w-[1400px] w-[94vw] max-h-[90vh] overflow-y-auto sm:!max-w-[1400px]">
        <DialogHeader>
          <DialogTitle>Create New Student</DialogTitle>
          <DialogDescription>
            Add a new student to the system with complete information
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Student Info</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="family">Family</TabsTrigger>
            <TabsTrigger value="school">School Form</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
                <CardDescription>Basic student details and personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="lrn">LRN (12-digit) *</Label>
                    <Input
                      id="lrn"
                      placeholder="000000000000"
                      maxLength={12}
                      value={formData.lrn}
                      onChange={(e) => handleInputChange('lrn', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sex *</Label>
                    <Select value={formData.sex} onValueChange={(value) => handleInputChange('sex', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sex" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input
                      id="middleName"
                      value={formData.middleName}
                      onChange={(e) => handleInputChange('middleName', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Birth Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !birthDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {birthDate ? birthDate.toLocaleDateString() : "Pick a date"}
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
                    <Label htmlFor="age">Age (Auto-calculated)</Label>
                    <Input
                      id="age"
                      value={formData.age}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="motherTongue">Mother Tongue</Label>
                    <Input
                      id="motherTongue"
                      value={formData.motherTongue}
                      onChange={(e) => handleInputChange('motherTongue', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ipEthnicGroup">IP/Ethnic Group</Label>
                    <Input
                      id="ipEthnicGroup"
                      value={formData.ipEthnicGroup}
                      onChange={(e) => handleInputChange('ipEthnicGroup', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="religion">Religion</Label>
                    <Input
                      id="religion"
                      value={formData.religion}
                      onChange={(e) => handleInputChange('religion', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="address" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Residential Address</CardTitle>
                <CardDescription>Student's current residential information (Optional)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="houseNo">House No.</Label>
                    <Input
                      id="houseNo"
                      value={formData.houseNo}
                      onChange={(e) => handleInputChange('houseNo', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street">Street</Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      value={formData.region}
                      onChange={(e) => handleInputChange('region', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Input
                      id="province"
                      value={formData.province}
                      onChange={(e) => handleInputChange('province', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="municipality">Municipality</Label>
                    <Input
                      id="municipality"
                      value={formData.municipality}
                      onChange={(e) => handleInputChange('municipality', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barangay">Barangay</Label>
                    <Input
                      id="barangay"
                      value={formData.barangay}
                      onChange={(e) => handleInputChange('barangay', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="family" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Father's Information</CardTitle>
                  <CardDescription>Optional information about the father</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fatherLastName">Last Name</Label>
                      <Input
                        id="fatherLastName"
                        value={formData.fatherLastName}
                        onChange={(e) => handleInputChange('fatherLastName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fatherFirstName">First Name</Label>
                      <Input
                        id="fatherFirstName"
                        value={formData.fatherFirstName}
                        onChange={(e) => handleInputChange('fatherFirstName', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fatherMiddleName">Middle Name</Label>
                    <Input
                      id="fatherMiddleName"
                      value={formData.fatherMiddleName}
                      onChange={(e) => handleInputChange('fatherMiddleName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fatherContact">Contact Number</Label>
                    <Input
                      id="fatherContact"
                      value={formData.fatherContact}
                      onChange={(e) => handleInputChange('fatherContact', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mother's Information</CardTitle>
                  <CardDescription>Optional information about the mother</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="motherLastName">Last Name</Label>
                      <Input
                        id="motherLastName"
                        value={formData.motherLastName}
                        onChange={(e) => handleInputChange('motherLastName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="motherFirstName">First Name</Label>
                      <Input
                        id="motherFirstName"
                        value={formData.motherFirstName}
                        onChange={(e) => handleInputChange('motherFirstName', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motherMiddleName">Middle Name</Label>
                    <Input
                      id="motherMiddleName"
                      value={formData.motherMiddleName}
                      onChange={(e) => handleInputChange('motherMiddleName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motherContact">Contact Number</Label>
                    <Input
                      id="motherContact"
                      value={formData.motherContact}
                      onChange={(e) => handleInputChange('motherContact', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Guardian's Information</CardTitle>
                <CardDescription>Optional guardian information if different from parents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guardianFullName">Full Name</Label>
                    <Input
                      id="guardianFullName"
                      value={formData.guardianFullName}
                      onChange={(e) => handleInputChange('guardianFullName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardianRelation">Relationship</Label>
                    <Input
                      id="guardianRelation"
                      value={formData.guardianRelation}
                      onChange={(e) => handleInputChange('guardianRelation', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardianContact">Contact Number</Label>
                    <Input
                      id="guardianContact"
                      value={formData.guardianContact}
                      onChange={(e) => handleInputChange('guardianContact', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="school" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>School Form Information</CardTitle>
                <CardDescription>Academic enrollment and school details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName">School Name</Label>
                    <Input
                      id="schoolName"
                      value={formData.schoolName}
                      onChange={(e) => handleInputChange('schoolName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schoolId">School ID</Label>
                    <Input
                      id="schoolId"
                      value={formData.schoolId}
                      onChange={(e) => handleInputChange('schoolId', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="schoolRegion">School Region</Label>
                    <Input
                      id="schoolRegion"
                      value={formData.schoolRegion}
                      onChange={(e) => handleInputChange('schoolRegion', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="division">Division</Label>
                    <Input
                      id="division"
                      value={formData.division}
                      onChange={(e) => handleInputChange('division', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Select value={formData.semester} onValueChange={(value) => handleInputChange('semester', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st">1st Semester</SelectItem>
                        <SelectItem value="2nd">2nd Semester</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schoolYear">School Year</Label>
                    <Input
                      id="schoolYear"
                      value={formData.schoolYear}
                      onChange={(e) => handleInputChange('schoolYear', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Grade Level</Label>
                    <Select value={formData.gradeLevel} onValueChange={(value) => handleInputChange('gradeLevel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="11">Grade 11</SelectItem>
                        <SelectItem value="12">Grade 12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="section">Section</Label>
                    <Input
                      id="section"
                      value={formData.section}
                      onChange={(e) => handleInputChange('section', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Track & Strand</Label>
                    <Select value={formData.trackStrand} onValueChange={(value) => handleInputChange('trackStrand', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select track & strand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ABM">ABM (Accountancy, Business & Management)</SelectItem>
                        <SelectItem value="STEM">STEM (Science, Technology, Engineering & Mathematics)</SelectItem>
                        <SelectItem value="HUMSS">HUMSS (Humanities & Social Sciences)</SelectItem>
                        <SelectItem value="GAS">GAS (General Academic Strand)</SelectItem>
                        <SelectItem value="TVL-ICT">TVL-ICT (Information & Communications Technology)</SelectItem>
                        <SelectItem value="TVL-HE">TVL-HE (Home Economics)</SelectItem>
                        <SelectItem value="TVL-IA">TVL-IA (Industrial Arts)</SelectItem>
                        <SelectItem value="TVL-Agri">TVL-Agri (Agriculture & Fishery Arts)</SelectItem>
                        <SelectItem value="Arts & Design">Arts & Design</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course">Specialized Subject/Course (if applicable)</Label>
                  <Input
                    id="course"
                    value={formData.course}
                    onChange={(e) => handleInputChange('course', e.target.value)}
                    placeholder="e.g. Computer Programming, Cookery, etc."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button variant="outline" onClick={handleResetClick}>
            Reset Form
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.lrn || !formData.firstName || !formData.lastName || !formData.sex || !birthDate}
          >
            Create Student
          </Button>
        </div>
      </DialogContent>

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Form?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all the information you've entered. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}