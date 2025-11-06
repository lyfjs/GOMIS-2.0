/**
 * Central API for managing all application data
 * This file provides a single source of truth for data operations
 * and makes it easy to switch from localStorage to a real backend
 */

// ===========================
// TYPE DEFINITIONS
// ===========================

export interface User {
  id: string
  email: string
  password: string
  firstName: string
  lastName: string
  position: string
  workPosition?: string
  specialization?: string
  createdAt: string
}

export interface Student {
  id: string
  lrn: string
  firstName: string
  lastName: string
  middleName?: string
  grade: string
  section: string
  track: string
  strand: string
  specialization: string
  dateOfBirth?: string
  address?: string
  contactNumber?: string
  guardianName?: string
  guardianContact?: string
  status: 'Active' | 'Inactive' | 'Dropped' | 'Graduated'
  createdAt: string
  updatedAt: string
}

export interface Appointment {
  id: string
  studentId: string
  studentName: string
  date: string
  time: string
  purpose: string
  status: 'Scheduled' | 'Completed' | 'Cancelled'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Session {
  id: string
  sessionId: string
  date: string
  time: string
  type: 'Individual' | 'Group'
  category: 'Academic' | 'Personal' | 'Career' | 'Social'
  participants: string[]
  studentNames?: string[]
  topic: string
  notes?: string
  outcome?: string
  followUp?: boolean
  createdAt: string
  updatedAt: string
}

export interface Incident {
  id: string
  incidentId: string
  date: string
  time: string
  location: string
  type: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  studentsInvolved: string[]
  studentNames?: string[]
  description: string
  actionTaken?: string
  reportedBy?: string
  status: 'Open' | 'Under Investigation' | 'Resolved' | 'Closed'
  createdAt: string
  updatedAt: string
}

export interface Violation {
  id: string
  studentId: string
  studentName: string
  violationType: string
  date: string
  description: string
  severity: 'Minor' | 'Major' | 'Severe'
  actionTaken?: string
  status: 'Pending' | 'Resolved' | 'Appealed'
  createdAt: string
  updatedAt: string
}

export interface Settings {
  twoFactorEnabled: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  appointmentReminders: boolean
  incidentAlerts: boolean
  sessionTimeout: boolean
  automaticBackups: boolean
  dbConfig: string
  backupPath: string
  retentionType: 'months' | 'years'
  retentionValue: string
  theme?: string
}

export interface DroppingForm {
  id: string
  studentId: string
  schoolYear: string
  semester: string
  date: string
  studentName: string
  trackAndStrand: string
  specialization: string
  adviser: string
  gradeAndSection: string
  inclusive: string
  actionTaken: string
  reasonForDropping: string
  effectiveDate: string
  signerName: string
  createdAt: string
}

export interface GoodMoralCertificate {
  id: string
  studentId: string
  studentName: string
  lrn?: string
  includeLRN: boolean
  schoolYear: string
  trackAndStrand: string
  specialization: string
  purpose: string
  dateGiven: string
  signerName: string
  signerPosition: string
  createdAt: string
}

// (Remove DataAPI, EventEmitter, all localStorage code, and all exported instance stuff.)
// Only export type/interface definitions that are used in other modules.
