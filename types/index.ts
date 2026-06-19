// ───────────────────────────────────────────────────────────────────────────────
// Data Models - All application data structures in one place
// ───────────────────────────────────────────────────────────────────────────────

// ─── Sales ────────────────────────────────────────────────────────────────────

export type SalesStatus = "completed" | "pending" | "cancelled"

export interface Sale {
  id: string
  customerName: string
  course: string
  amount: number
  quantity: number
  salesperson: string
  date: string
  status: SalesStatus
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export type TaskPriority = "high" | "medium" | "low"

export interface Task {
  id: string
  title: string
  assignee: string
  dueDate: string
  priority: TaskPriority
  completed: boolean
}

// ─── Team ─────────────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string
  name: string
  role: string
  sales: number
  deals: number
  target: number
  avatar: string
  attendanceDays: number
}

// ─── Communication ────────────────────────────────────────────────────────────

export interface CallLog {
  id: string
  employeeName: string
  callDate: string
  callCount: number
  notes?: string
}

// ─── Finance ──────────────────────────────────────────────────────────────────

export type TransactionType = "payment" | "refund" | "discount"
export type TransactionStatus = "paid" | "pending" | "overdue"

export interface Transaction {
  id: string
  date: string
  amount: number
  type: TransactionType
  description: string
  status: TransactionStatus
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export type AttendanceStatus = "present" | "absent" | "excused"

export interface AttendanceRecord {
  id: string
  sessionDate: string
  sessionTitle: string
  lecturer: string
  status: AttendanceStatus
  notes?: string
}

// ─── Students ─────────────────────────────────────────────────────────────────

export interface Student {
  id: string
  name: string
  phone: string
  email: string
  course: string
  enrolledDate: string
  salesperson: string
  totalFees: number
  paidAmount: number
  transactions: Transaction[]
  attendance: AttendanceRecord[]
}

// ─── Leads ────────────────────────────────────────────────────────────────────

export type LeadStatus = "new" | "contacted" | "interested" | "enrolled" | "lost"
export type FollowUpType = "call" | "whatsapp" | "email" | "meeting"
export type FollowUpStatus = "pending" | "done" | "cancelled"
export type SentimentType = "positive" | "neutral" | "negative"

export interface Feedback {
  id: string
  date: string
  notes: string
  sentiment: SentimentType
}

export interface FollowUp {
  id: string
  scheduledDate: string
  notes: string
  status: FollowUpStatus
  type: FollowUpType
  createdAt?: string
}

export interface Lead {
  id: string
  name: string
  phone: string
  email?: string
  interestedCourse: string
  assignedTo: string
  status: LeadStatus
  source: string
  createdAt: string
  feedback: Feedback[]
  followUps: FollowUp[]
}

// ─── Authentication & Authorization ───────────────────────────────────────────

export type UserRole = "super_admin" | "admin" | "manager" | "sales" | "viewer"

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  team_member_name: string | null
  is_active: boolean
  last_login: string | null
  created_at: string
  avatar_url: string | null
  phone: string | null
  permissions: string[]
}

export interface Permission {
  key: string
  label: string
  group: string
}

// ─── Dashboard & UI ────────────────────────────────────────────────────────────

export interface DashboardTab {
  value: string
  label: string
  icon: React.ElementType
  roles: UserRole[]
  permissions?: string[]
}

export interface SalesMetrics {
  totalSales: number
  totalQuantity: number
  averageDealSize: number
  conversionRate: number
}

export interface APIResponse<T> {
  data: T | null
  error: string | null
  isLoading: boolean
}

export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface FilterParams {
  search?: string
  status?: string
  dateRange?: {
    from: string
    to: string
  }
  [key: string]: unknown
}
