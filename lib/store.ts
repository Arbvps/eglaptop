import useSWR, { mutate } from "swr"
import type {
  Sale,
  Task,
  TeamMember,
  CallLog,
  Transaction,
  AttendanceRecord,
  Student,
  Feedback,
  FollowUp,
  Lead,
} from "@/types"

// Re-export types for backward compatibility
export type { Sale, Task, TeamMember, CallLog, Transaction, AttendanceRecord, Student, Feedback, FollowUp, Lead }

// ─── Constants ────────────────────────────────────────────────────────────────

export const TEAM_MEMBERS = [
  "كريستين", "حامد", "هبه", "أيمن", "نورهان", "يوسف", "إيلاريا",
] as const

export const COURSES = [
  "كورس البرمجة الشاملة",
  "كورس التصميم الجرافيكي",
  "كورس اللغة الإنجليزية",
  "كورس التسويق الرقمي",
  "كورس إدارة المشاريع",
  "كورس تحليل البيانات",
  "كورس الذكاء الاصطناعي",
  "كورس تطوير المواقع",
] as const

export const LECTURERS = [
  "د. أحمد رضا",
  "م. ليلى فاروق",
  "أ. خالد منصور",
  "د. سمر النجار",
  "م. تامر عبد الله",
  "أ. ريم الشافعي",
] as const

// ─── Fetcher ──────────────────────────────────────────────────────────────────

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// ─── Map DB rows → app types ──────────────────────────────────────────────────

function mapSale(r: Record<string, unknown>): Sale {
  return {
    id: r.id as string,
    customerName: (r.customer_name ?? r.customerName) as string,
    course: r.course as string,
    amount: Number(r.amount),
    quantity: Number(r.quantity),
    salesperson: r.salesperson as string,
    date: r.date as string,
    status: r.status as Sale["status"],
  }
}

function mapTask(r: Record<string, unknown>): Task {
  return {
    id: r.id as string,
    title: r.title as string,
    assignee: r.assignee as string,
    dueDate: (r.due_date ?? r.dueDate) as string,
    priority: r.priority as Task["priority"],
    completed: r.completed as boolean,
  }
}

function mapStudent(r: Record<string, unknown>): Student {
  const txs = ((r.transactions as Record<string, unknown>[]) ?? []).map((t) => ({
    id: t.id as string,
    date: t.date as string,
    amount: Number(t.amount),
    type: t.type as Transaction["type"],
    description: t.description as string,
    status: t.status as Transaction["status"],
  }))
  const atts = ((r.attendance as Record<string, unknown>[]) ?? []).map((a) => ({
    id: a.id as string,
    sessionDate: (a.session_date ?? a.sessionDate) as string,
    sessionTitle: (a.session_title ?? a.sessionTitle) as string,
    lecturer: a.lecturer as string,
    status: a.status as AttendanceRecord["status"],
    notes: a.notes as string | undefined,
  }))
  return {
    id: r.id as string,
    name: r.name as string,
    phone: r.phone as string,
    email: (r.email ?? "") as string,
    course: r.course as string,
    enrolledDate: (r.enrolled_date ?? r.enrolledDate) as string,
    salesperson: r.salesperson as string,
    totalFees: Number(r.total_fees ?? r.totalFees),
    paidAmount: Number(r.paid_amount ?? r.paidAmount),
    transactions: txs,
    attendance: atts,
  }
}

function mapLead(r: Record<string, unknown>): Lead {
  const fbs = ((r.feedback as Record<string, unknown>[]) ?? []).map((f) => ({
    id: f.id as string,
    date: f.date as string,
    notes: f.notes as string,
    sentiment: f.sentiment as Feedback["sentiment"],
  }))
  const fus = ((r.follow_ups ?? r.followUps) as Record<string, unknown>[] ?? []).map((f) => ({
    id: f.id as string,
    scheduledDate: (f.scheduled_date ?? f.scheduledDate) as string,
    notes: f.notes as string,
    status: f.status as FollowUp["status"],
    type: f.type as FollowUp["type"],
    createdAt: (f.created_at ?? f.createdAt) as string | undefined,
  }))
  return {
    id: r.id as string,
    name: r.name as string,
    phone: r.phone as string,
    email: r.email as string | undefined,
    interestedCourse: (r.interested_course ?? r.interestedCourse) as string,
    assignedTo: (r.assigned_to ?? r.assignedTo) as string,
    status: r.status as Lead["status"],
    source: r.source as string,
    createdAt: (r.created_at ?? r.createdAt) as string,
    feedback: fbs,
    followUps: fus,
  }
}

function mapTeam(r: Record<string, unknown>): TeamMember {
  return {
    id: r.id as string,
    name: r.name as string,
    role: r.role as string,
    sales: Number(r.sales ?? 0),
    deals: Number(r.deals ?? 0),
    target: Number(r.target),
    avatar: (r.avatar ?? (r.name as string).charAt(0)) as string,
    attendanceDays: Number(r.attendance_days ?? r.attendanceDays ?? 0),
  }
}

function mapCallLog(r: Record<string, unknown>): CallLog {
  return {
    id: r.id as string,
    employeeName: (r.employee_name ?? r.employeeName) as string,
    callDate: (r.call_date ?? r.callDate) as string,
    callCount: Number(r.call_count ?? r.callCount),
    notes: r.notes as string | undefined,
  }
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useSales() {
  const { data, error, isLoading } = useSWR<unknown[]>("/api/sales", fetcher)
  const sales: Sale[] = (data ?? []).map(mapSale)

  const addSale = async (sale: Omit<Sale, "id">) => {
    await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: sale.customerName,
        course: sale.course,
        amount: sale.amount,
        quantity: sale.quantity,
        salesperson: sale.salesperson,
        date: sale.date,
        status: sale.status,
      }),
    })
    mutate("/api/sales")
    mutate("/api/team")
  }

  const deleteSale = async (id: string) => {
    await fetch("/api/sales", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    mutate("/api/sales")
    mutate("/api/team")
  }

  return { sales, error, isLoading, addSale, deleteSale }
}

export function useTasks() {
  const { data, error, isLoading } = useSWR<unknown[]>("/api/tasks", fetcher)
  const tasks: Task[] = (data ?? []).map(mapTask)

  const addTask = async (task: Omit<Task, "id">) => {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: task.title,
        assignee: task.assignee,
        due_date: task.dueDate,
        priority: task.priority,
        completed: task.completed,
      }),
    })
    mutate("/api/tasks")
  }

  const toggleTask = async (id: string, completed: boolean) => {
    await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    })
    mutate("/api/tasks")
  }

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" })
    mutate("/api/tasks")
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const mapped: Record<string, unknown> = {}
    if ("title" in updates) mapped.title = updates.title
    if ("assignee" in updates) mapped.assignee = updates.assignee
    if ("dueDate" in updates) mapped.due_date = updates.dueDate
    if ("priority" in updates) mapped.priority = updates.priority
    if ("completed" in updates) mapped.completed = updates.completed
    await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mapped),
    })
    mutate("/api/tasks")
  }

  return { tasks, error, isLoading, addTask, toggleTask, deleteTask, updateTask }
}

export function useTeam() {
  const { data, error, isLoading } = useSWR<unknown[]>("/api/team", fetcher)
  const team: TeamMember[] = (data ?? []).map(mapTeam)

  const updateMember = async (name: string, updates: Partial<TeamMember>) => {
    await fetch("/api/team", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        attendanceDays: updates.attendanceDays,
        target: updates.target,
        role: updates.role,
      }),
    })
    mutate("/api/team")
  }

  return { team, error, isLoading, updateMember }
}

export function useCallLogs(employee?: string) {
  const key = employee ? `/api/call-logs?employee=${encodeURIComponent(employee)}` : "/api/call-logs"
  const { data, error, isLoading } = useSWR<unknown[]>(key, fetcher)
  const callLogs: CallLog[] = (data ?? []).map(mapCallLog)

  const addCallLog = async (log: { employeeName: string; callDate: string; callCount: number; notes?: string }) => {
    await fetch("/api/call-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employee_name: log.employeeName,
        call_date: log.callDate,
        call_count: log.callCount,
        notes: log.notes,
      }),
    })
    mutate(key)
    mutate("/api/call-logs")
  }

  return { callLogs, error, isLoading, addCallLog }
}

export function useStudents() {
  const { data, error, isLoading } = useSWR<unknown[]>("/api/students", fetcher)
  const students: Student[] = (data ?? []).map(mapStudent)

  const addStudent = async (s: Omit<Student, "id" | "transactions" | "attendance">) => {
    await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: s.name,
        phone: s.phone,
        email: s.email,
        course: s.course,
        enrolled_date: s.enrolledDate,
        salesperson: s.salesperson,
        total_fees: s.totalFees,
        paid_amount: s.paidAmount,
      }),
    })
    mutate("/api/students")
  }

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    const mapped: Record<string, unknown> = {}
    if ("name" in updates) mapped.name = updates.name
    if ("phone" in updates) mapped.phone = updates.phone
    if ("email" in updates) mapped.email = updates.email
    if ("course" in updates) mapped.course = updates.course
    if ("totalFees" in updates) mapped.total_fees = updates.totalFees
    if ("salesperson" in updates) mapped.salesperson = updates.salesperson
    await fetch(`/api/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mapped),
    })
    mutate("/api/students")
  }

  const deleteStudent = async (id: string) => {
    await fetch(`/api/students/${id}`, { method: "DELETE" })
    mutate("/api/students")
  }

  const addTransaction = async (studentId: string, tx: Omit<Transaction, "id">) => {
    await fetch(`/api/students/${studentId}/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "transaction", ...tx }),
    })
    mutate("/api/students")
  }

  const addAttendance = async (studentId: string, record: Omit<AttendanceRecord, "id">) => {
    await fetch(`/api/students/${studentId}/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "attendance", ...record }),
    })
    mutate("/api/students")
  }

  return { students, error, isLoading, addStudent, updateStudent, deleteStudent, addTransaction, addAttendance }
}

export function useLeads() {
  const { data, error, isLoading } = useSWR<unknown[]>("/api/leads", fetcher)
  const leads: Lead[] = (data ?? []).map(mapLead)

  const addLead = async (lead: Omit<Lead, "id" | "feedback" | "followUps">) => {
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        interested_course: lead.interestedCourse,
        assigned_to: lead.assignedTo,
        status: lead.status,
        source: lead.source,
      }),
    })
    mutate("/api/leads")
  }

  const updateLeadStatus = async (id: string, status: Lead["status"]) => {
    await fetch(`/api/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    mutate("/api/leads")
  }

  const deleteLead = async (id: string) => {
    await fetch(`/api/leads/${id}`, { method: "DELETE" })
    mutate("/api/leads")
  }

  const addFeedback = async (leadId: string, fb: Omit<Feedback, "id">) => {
    await fetch(`/api/leads/${leadId}/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "feedback", ...fb }),
    })
    mutate("/api/leads")
  }

  const addFollowUp = async (leadId: string, fu: Omit<FollowUp, "id" | "createdAt">) => {
    await fetch(`/api/leads/${leadId}/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "followup", ...fu }),
    })
    mutate("/api/leads")
  }

  const toggleFollowUp = async (leadId: string, fuId: string, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "pending" : "done"
    await fetch(`/api/followups/${fuId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    mutate("/api/leads")
  }

  return { leads, error, isLoading, addLead, updateLeadStatus, deleteLead, addFeedback, addFollowUp, toggleFollowUp }
}
