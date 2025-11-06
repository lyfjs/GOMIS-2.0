import { http } from './http'

export type Preferences = {
  userId: number
  theme?: 'default' | 'dark' | 'scaled' | 'mono'
  twoFactorEnabled?: boolean
  emailNotifications?: boolean
  smsNotifications?: boolean
  appointmentReminders?: boolean
  incidentAlerts?: boolean
  sessionTimeout?: boolean
  backupPath?: string
  retentionType?: 'months' | 'years'
  retentionValue?: string
}

export function getPreferences(userId: number) {
  return http.get<Preferences>(`/api/preferences/${userId}`)
}

export function updatePreferences(userId: number, prefs: Partial<Preferences>) {
  return http.put<Preferences>(`/api/preferences/${userId}`, prefs)
}



