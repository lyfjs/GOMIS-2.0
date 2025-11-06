import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Eye, EyeOff } from 'lucide-react'
import { register } from '../../lib/api.users'
import { toast } from 'sonner'
import logo from '../../assets/logo.png'

interface RegisterFormProps {
  onRegister: () => void
  onSwitchToLogin: () => void
}

export function RegisterForm({ onRegister, onSwitchToLogin }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    gender: '',
    email: '',
    specialization: '',
    customSpecialization: '',
    workPosition: '',
    customWorkPosition: '',
    contactNo: '+63',
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.gender) newErrors.gender = 'Gender is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.specialization.trim() && !formData.customSpecialization.trim()) {
      newErrors.specialization = 'Specialization is required'
    }
    if (!formData.workPosition.trim() && !formData.customWorkPosition.trim()) {
      newErrors.workPosition = 'Work position is required'
    }
    if (!formData.contactNo.trim() || formData.contactNo === '+63') newErrors.contactNo = 'Contact number is required'
    if (!formData.password) newErrors.password = 'Password is required'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    const finalSpecialization = formData.specialization === 'other' 
      ? formData.customSpecialization 
      : formData.specialization
    const finalWorkPosition = formData.workPosition === 'other' 
      ? formData.customWorkPosition 
      : formData.workPosition
    
    try {
      const genderMap: Record<string, any> = {
        'male': 'MALE',
        'female': 'FEMALE',
        'other': 'OTHER',
        'prefer-not-to-say': 'PREFER_NOT_TO_SAY',
      }
      const mappedGender = genderMap[formData.gender] || 'PREFER_NOT_TO_SAY'
      const created = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || undefined,
        suffix: formData.suffix || undefined,
        gender: mappedGender,
        specialization: finalSpecialization || undefined,
        position: finalWorkPosition || undefined,
        workPosition: finalWorkPosition || undefined,
        contactNo: formData.contactNo || undefined,
      })
      localStorage.setItem('gomis_current_user', JSON.stringify(created))
      setErrors({})
      onRegister()
    } catch (err: any) {
      const msg = String(err?.message || '')
      if (msg.includes('409')) {
        toast.error('Email already exists')
      } else if (msg.includes('400')) {
        toast.error('Invalid data. Please check required fields.')
      } else {
        toast.error('Registration failed. Please check backend logs for details.')
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      }
      
      if (name === 'specialization' && value !== 'other') {
        newData.customSpecialization = ''
      }
      if (name === 'workPosition' && value !== 'other') {
        newData.customWorkPosition = ''
      }
      
      return newData
    })
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex flex-col items-center mb-2">
              <img src={logo} alt="School Logo" className="h-16 w-16 rounded-full mb-3" />
              <div>
                <h2>Guidance Office</h2>
                <p className="text-muted-foreground">Management System</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? 'border-destructive' : ''}
                />
                {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name (Optional)</Label>
                <Input
                  id="middleName"
                  name="middleName"
                  placeholder="Enter middle name"
                  value={formData.middleName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? 'border-destructive' : ''}
                />
                {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="suffix">Suffix</Label>
                <Select onValueChange={(value) => handleSelectChange('suffix', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select suffix (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Jr.">Jr.</SelectItem>
                    <SelectItem value="Sr.">Sr.</SelectItem>
                    <SelectItem value="II">II</SelectItem>
                    <SelectItem value="III">III</SelectItem>
                    <SelectItem value="IV">IV</SelectItem>
                    <SelectItem value="V">V</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select onValueChange={(value) => handleSelectChange('gender', value)}>
                <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization *</Label>
                <Select onValueChange={(value) => handleSelectChange('specialization', value)}>
                  <SelectTrigger className={errors.specialization ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic-counseling">Academic Counseling</SelectItem>
                    <SelectItem value="career-guidance">Career Guidance</SelectItem>
                    <SelectItem value="personal-counseling">Personal Counseling</SelectItem>
                    <SelectItem value="behavioral-intervention">Behavioral Intervention</SelectItem>
                    <SelectItem value="crisis-counseling">Crisis Counseling</SelectItem>
                    <SelectItem value="special-needs">Special Needs Support</SelectItem>
                    <SelectItem value="family-counseling">Family Counseling</SelectItem>
                    <SelectItem value="other">Other (specify below)</SelectItem>
                  </SelectContent>
                </Select>
                {formData.specialization === 'other' && (
                  <Input
                    name="customSpecialization"
                    placeholder="Enter your specialization"
                    value={formData.customSpecialization}
                    onChange={handleChange}
                    className={errors.specialization ? 'border-destructive' : ''}
                  />
                )}
                {errors.specialization && <p className="text-sm text-destructive">{errors.specialization}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workPosition">Work Position *</Label>
                <Select onValueChange={(value) => handleSelectChange('workPosition', value)}>
                  <SelectTrigger className={errors.workPosition ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select work position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="subject-teacher">Subject Teacher</SelectItem>
                    <SelectItem value="homeroom-teacher">Homeroom Teacher</SelectItem>
                    <SelectItem value="department-head">Department Head</SelectItem>
                    <SelectItem value="guidance-counselor">Guidance Counselor</SelectItem>
                    <SelectItem value="principal">Principal</SelectItem>
                    <SelectItem value="vice-principal">Vice Principal</SelectItem>
                    <SelectItem value="academic-coordinator">Academic Coordinator</SelectItem>
                    <SelectItem value="student-affairs-officer">Student Affairs Officer</SelectItem>
                    <SelectItem value="librarian">Librarian</SelectItem>
                    <SelectItem value="registrar">Registrar</SelectItem>
                    <SelectItem value="school-psychologist">School Psychologist</SelectItem>
                    <SelectItem value="social-worker">School Social Worker</SelectItem>
                    <SelectItem value="administrative-staff">Administrative Staff</SelectItem>
                    <SelectItem value="other">Other (specify below)</SelectItem>
                  </SelectContent>
                </Select>
                {formData.workPosition === 'other' && (
                  <Input
                    name="customWorkPosition"
                    placeholder="Enter your work position"
                    value={formData.customWorkPosition}
                    onChange={handleChange}
                    className={errors.workPosition ? 'border-destructive' : ''}
                  />
                )}
                {errors.workPosition && <p className="text-sm text-destructive">{errors.workPosition}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNo">Contact Number *</Label>
              <Input
                id="contactNo"
                name="contactNo"
                placeholder="+63XXXXXXXXXX"
                value={formData.contactNo}
                onChange={handleChange}
                className={errors.contactNo ? 'border-destructive' : ''}
              />
              {errors.contactNo && <p className="text-sm text-destructive">{errors.contactNo}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'border-destructive' : ''}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? 'border-destructive' : ''}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full">
              Register
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-primary hover:underline"
              >
                Sign in here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}