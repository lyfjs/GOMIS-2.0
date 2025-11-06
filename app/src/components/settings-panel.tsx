import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Separator } from './ui/separator'
import { Switch } from './ui/switch'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { useTheme } from './theme-provider'
import { Palette, Bell, Shield, Database, User, Lock, Save, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { meByEmail, updateUser, UserDTO } from '../lib/api.users'
import { getPreferences, updatePreferences } from '../lib/api.preferences'

export function SettingsPanel() {
  const { theme, setTheme } = useTheme()
  
  // State for settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false)
  const [show2FACodeDialog, setShow2FACodeDialog] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationAction, setVerificationAction] = useState<'disable-2fa' | 'change-password'>('change-password')
  const [retentionType, setRetentionType] = useState('years')
  const [retentionValue, setRetentionValue] = useState('7')
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  
  // Profile state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    position: '',
    specialization: ''
  })
  
  // Data management state
  const [dbConfig, setDbConfig] = useState('')
  const [backupPath, setBackupPath] = useState('')
  const [isCheckingDb, setIsCheckingDb] = useState(false)
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleLogout = () => {
    localStorage.removeItem('gomis_current_user')
    window.location.reload()
  }

  const themeOptions = [
    { value: 'default', label: 'Default', description: 'Standard light theme' },
    { value: 'dark', label: 'Dark', description: 'Dark mode theme' },
    { value: 'scaled', label: 'Scaled', description: 'Larger text and components' },
    { value: 'mono', label: 'Mono', description: 'Monospace font theme' },
  ]

  // Load user data from backend (and fallback to local if needed)
  useEffect(() => {
    const init = async () => {
      const stored = localStorage.getItem('gomis_current_user')
      if (stored) {
        const user: UserDTO = JSON.parse(stored)
        try {
          const fresh = await meByEmail(user.email)
          localStorage.setItem('gomis_current_user', JSON.stringify(fresh))
          setCurrentUserId(fresh.id)
          setProfileData({
            firstName: fresh.firstName || '',
            lastName: fresh.lastName || '',
            email: fresh.email || '',
            position: fresh.position || fresh.workPosition || '',
            specialization: fresh.specialization || ''
          })
          try {
            const prefs = await getPreferences(fresh.id)
            if (prefs.theme) setTheme(prefs.theme as any)
            if (typeof prefs.twoFactorEnabled === 'boolean') setTwoFactorEnabled(prefs.twoFactorEnabled)
            if (prefs.backupPath) setBackupPath(prefs.backupPath)
            if (prefs.retentionType) setRetentionType(prefs.retentionType as any)
            if (prefs.retentionValue) setRetentionValue(prefs.retentionValue)
          } catch {}
        } catch {
          setProfileData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            position: (user as any).position || (user as any).workPosition || '',
            specialization: user.specialization || ''
          })
        }
      }

      const settings = localStorage.getItem('gomis_settings')
      if (settings) {
        const parsed = JSON.parse(settings)
        setDbConfig(parsed.dbConfig || '')
      }
    }
    init()
  }, [])

  const handleProfileUpdate = async () => {
    const currentUser = localStorage.getItem('gomis_current_user')
    if (!currentUser) return
    const user: UserDTO = JSON.parse(currentUser)
    try {
      const updated = await updateUser(user.id, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        position: profileData.position,
        workPosition: profileData.position,
        specialization: profileData.specialization,
      })
      localStorage.setItem('gomis_current_user', JSON.stringify(updated))
      toast.success('Profile updated successfully!')
    } catch (e: any) {
      toast.error('Failed to update profile')
    }
  }

  const handleTwoFactorToggle = async (checked: boolean) => {
    // If trying to disable 2FA, require verification
    if (!checked && twoFactorEnabled) {
      setVerificationAction('disable-2fa')
      setShow2FACodeDialog(true)
    } else {
      // Enabling 2FA - allow directly
      setTwoFactorEnabled(checked)
      if (currentUserId) {
        await updatePreferences(currentUserId, { twoFactorEnabled: checked })
      }
      toast.success(checked ? '2FA enabled successfully!' : '2FA disabled successfully!')
    }
  }

  const handleChangePassword = () => {
    if (twoFactorEnabled) {
      // Show 2FA code dialog first
      setVerificationAction('change-password')
      setShow2FACodeDialog(true)
    } else {
      // Directly show password change dialog
      setShowChangePasswordDialog(true)
    }
  }

  const handleVerify2FA = () => {
    // Simulate 2FA verification
    if (verificationCode === '123456' || verificationCode.length === 6) {
      setShow2FACodeDialog(false)
      setVerificationCode('')
      
      if (verificationAction === 'disable-2fa') {
        // Disable 2FA after successful verification
        setTwoFactorEnabled(false)
        const settings = JSON.parse(localStorage.getItem('gomis_settings') || '{}')
        settings.twoFactorEnabled = false
        localStorage.setItem('gomis_settings', JSON.stringify(settings))
        toast.success('2FA disabled successfully!')
      } else if (verificationAction === 'change-password') {
        // Proceed to password change
        setShowChangePasswordDialog(true)
        toast.success('Verification successful')
      }
    } else {
      toast.error('Invalid verification code')
    }
  }

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    // Update password
    const currentUser = localStorage.getItem('gomis_current_user')
    if (currentUser) {
      const user = JSON.parse(currentUser)
      
      // Verify current password (in real app, this would be hashed)
      if (user.password !== passwordData.currentPassword) {
        toast.error('Current password is incorrect')
        return
      }

      user.password = passwordData.newPassword
      localStorage.setItem('gomis_current_user', JSON.stringify(user))
      
      // Update in registered users
      const registeredUsers = localStorage.getItem('gomis_registered_users')
      if (registeredUsers) {
        const users = JSON.parse(registeredUsers)
        const updatedUsers = users.map((u: any) => 
          u.email === user.email ? user : u
        )
        localStorage.setItem('gomis_registered_users', JSON.stringify(updatedUsers))
      }

      toast.success('Password changed successfully!')
      setShowChangePasswordDialog(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    }
  }

  const handleSaveSettings = async () => {
    if (currentUserId) {
      await updatePreferences(currentUserId, {
        backupPath,
        retentionType: retentionType as any,
        retentionValue,
      })
    }
    toast.success('Settings saved successfully!')
  }

  const handleCheckDatabase = async () => {
    try {
      setIsCheckingDb(true)
      // Set baseUrl to Flask backend
      const baseUrl = 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/students/count/status/ACTIVE`)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const count = await res.text()
      toast.success(`Database reachable. ACTIVE students: ${count}`)
    } catch (err: any) {
      toast.error(`Database check failed: ${err?.message || 'Unknown error'}`)
    } finally {
      setIsCheckingDb(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="animate-slide-in-top">
        <h1>Settings</h1>
        <p className="text-muted-foreground">Customize your guidance office management experience</p>
      </div>

      <div className="grid gap-6 animate-stagger">
        {/* Profile Edit */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={profileData.position}
                  onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={profileData.specialization}
                  onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleProfileUpdate} className="gap-2">
              <Save className="h-4 w-4" />
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel of your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme-select">Theme</Label>
              <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
                <SelectTrigger id="theme-select">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  {themeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email alerts for important updates</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Send via SMS</Label>
                <p className="text-sm text-muted-foreground">Receive SMS notifications for urgent matters</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Appointment Reminders</Label>
                <p className="text-sm text-muted-foreground">Get reminders for upcoming appointments</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Incident Alerts</Label>
                <p className="text-sm text-muted-foreground">Immediate notifications for new incidents</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>Manage your privacy and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Switch 
                checked={twoFactorEnabled}
                onCheckedChange={handleTwoFactorToggle}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Session Timeout</Label>
                <p className="text-sm text-muted-foreground">Auto-logout after 30 minutes of inactivity</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Change Password</Label>
              <p className="text-sm text-muted-foreground mb-2">Update your account password</p>
              <Button variant="outline" onClick={handleChangePassword} className="gap-2">
                <Lock className="h-4 w-4" />
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>Control your data and backup preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Database Status</Label>
                <p className="text-sm text-muted-foreground">Check connection to backend database</p>
              </div>
              <Button onClick={handleCheckDatabase} disabled={isCheckingDb} variant="outline" className="gap-2">
                {isCheckingDb ? 'Checking…' : 'Check Connection'}
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="db-config">Database Configuration</Label>
              <Input
                id="db-config"
                placeholder="e.g., mongodb://localhost:27017/gomisdb"
                value={dbConfig}
                onChange={(e) => setDbConfig(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Enter your database connection string</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="backup-path">Backup Directory Path</Label>
              <Input
                id="backup-path"
                placeholder="e.g., /backups/gomis"
                value={backupPath}
                onChange={(e) => setBackupPath(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Specify the directory for backup files</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatic Backups</Label>
                <p className="text-sm text-muted-foreground">Daily backup of all student records</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Data Retention Period</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="7"
                  value={retentionValue}
                  onChange={(e) => setRetentionValue(e.target.value)}
                  className="flex-1"
                />
                <Select value={retentionType} onValueChange={setRetentionType}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                Data will be retained for {retentionValue} {retentionType}
              </p>
            </div>
            <Separator />
            <Button onClick={handleSaveSettings} className="gap-2">
              <Save className="h-4 w-4" />
              Save Data Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 2FA Verification Dialog */}
      <Dialog open={show2FACodeDialog} onOpenChange={(open) => {
        setShow2FACodeDialog(open)
        if (!open) {
          setVerificationCode('')
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              {verificationAction === 'disable-2fa' 
                ? 'Enter the 6-digit verification code to disable two-factor authentication'
                : 'Enter the 6-digit verification code to proceed with password change'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                placeholder="000000"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              />
              <p className="text-xs text-muted-foreground">
                A verification code has been sent to your registered device
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShow2FACodeDialog(false)
              setVerificationCode('')
            }}>
              Cancel
            </Button>
            <Button onClick={handleVerify2FA} disabled={verificationCode.length !== 6}>
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters long
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowChangePasswordDialog(false)
              setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            }}>
              Cancel
            </Button>
            <Button onClick={handlePasswordChange}>
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
