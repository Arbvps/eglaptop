import { createClient } from "@/lib/supabase/server"
export type { UserProfile } from "@/lib/auth-types"
export { ROLE_LABELS, ROLE_COLORS, ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from "@/lib/auth-types"
import type { UserProfile } from "@/lib/auth-types"

export type RolePermissions = {
  [role: string]: string[]
}

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "مدير عام",
  admin: "مدير",
  manager: "مشرف",
  sales: "مندوب مبيعات",
  viewer: "مشاهد فقط",
}

export const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-red-100 text-red-700",
  admin: "bg-orange-100 text-orange-700",
  manager: "bg-blue-100 text-blue-700",
  sales: "bg-emerald-100 text-emerald-700",
  viewer: "bg-slate-100 text-slate-600",
}

export const ALL_PERMISSIONS = [
  // Sales
  { key: "sales.view", label: "عرض المبيعات", group: "المبيعات" },
  { key: "sales.create", label: "إضافة مبيعات", group: "المبيعات" },
  { key: "sales.edit", label: "تعديل المبيعات", group: "المبيعات" },
  { key: "sales.delete", label: "حذف المبيعات", group: "المبيعات" },
  { key: "sales.export", label: "تصدير المبيعات", group: "المبيعات" },
  // Students
  { key: "students.view", label: "عرض الطلاب", group: "الطلاب" },
  { key: "students.create", label: "إضافة طلاب", group: "الطلاب" },
  { key: "students.edit", label: "تعديل بيانات الطلاب", group: "الطلاب" },
  { key: "students.delete", label: "حذف الطلاب", group: "الطلاب" },
  { key: "students.financial", label: "إدارة المالية للطلاب", group: "الطلاب" },
  { key: "students.attendance", label: "إدارة الحضور والغياب", group: "الطلاب" },
  // Leads
  { key: "leads.view", label: "عرض الليدز", group: "الليدز" },
  { key: "leads.create", label: "إضافة ليدز", group: "الليدز" },
  { key: "leads.edit", label: "تعديل الليدز", group: "الليدز" },
  { key: "leads.delete", label: "حذف الليدز", group: "الليدز" },
  { key: "leads.all", label: "عرض ليدز جميع الموظفين", group: "الليدز" },
  // Reports
  { key: "reports.view", label: "عرض التقارير", group: "التقارير" },
  { key: "reports.export", label: "تصدير التقارير", group: "التقارير" },
  { key: "reports.all_employees", label: "تقارير كل الموظفين", group: "التقارير" },
  // Tasks
  { key: "tasks.view", label: "عرض المهام", group: "المهام" },
  { key: "tasks.create", label: "إضافة مهام", group: "المهام" },
  { key: "tasks.edit", label: "تعديل المهام", group: "المهام" },
  { key: "tasks.delete", label: "حذف المهام", group: "المهام" },
  { key: "tasks.assign", label: "تعيين مهام للآخرين", group: "المهام" },
  // Team
  { key: "team.view", label: "عرض الفريق", group: "الفريق" },
  { key: "team.manage", label: "إدارة الفريق", group: "الفريق" },
  // Settings
  { key: "settings.view", label: "عرض الإعدادات", group: "الإعدادات" },
  { key: "settings.edit", label: "تعديل الإعدادات", group: "الإعدادات" },
  { key: "settings.integrations", label: "إدارة التكاملات", group: "الإعدادات" },
  // Admin
  { key: "admin.users", label: "إدارة المستخدمين", group: "الإدارة" },
  { key: "admin.roles", label: "إدارة الصلاحيات", group: "الإدارة" },
  { key: "admin.logs", label: "عرض سجل النشاطات", group: "الإدارة" },
  { key: "admin.full", label: "صلاحيات كاملة", group: "الإدارة" },
]

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ALL_PERMISSIONS.map(p => p.key),
  admin: ALL_PERMISSIONS.map(p => p.key).filter(k => k !== "admin.full"),
  manager: [
    "sales.view","sales.create","sales.edit","sales.export",
    "students.view","students.create","students.edit","students.financial","students.attendance",
    "leads.view","leads.create","leads.edit","leads.all",
    "reports.view","reports.export","reports.all_employees",
    "tasks.view","tasks.create","tasks.edit","tasks.assign",
    "team.view","settings.view",
    "admin.logs",
  ],
  sales: [
    "sales.view","sales.create",
    "students.view","students.attendance",
    "leads.view","leads.create","leads.edit",
    "reports.view",
    "tasks.view","tasks.create","tasks.edit",
    "team.view",
  ],
  viewer: [
    "sales.view","students.view","leads.view","reports.view","tasks.view","team.view",
  ],
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile) return null

  const { data: rolePerms } = await supabase
    .from("role_permissions")
    .select("permission_key")
    .eq("role", profile.role)

  const { data: userPerms } = await supabase
    .from("user_permissions")
    .select("permission_key, granted")
    .eq("user_id", user.id)

  const basePerms = new Set((rolePerms || []).map((p: any) => p.permission_key))
  for (const up of userPerms || []) {
    if (up.granted) basePerms.add(up.permission_key)
    else basePerms.delete(up.permission_key)
  }

  return { ...profile, permissions: Array.from(basePerms) }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: false })
  return (data || []) as UserProfile[]
}

export async function getActivityLogs(limit = 100) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("activity_logs")
    .select("*, user:user_profiles!user_id(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(limit)
  return data || []
}

export async function getUserPermissions(userId: string) {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", userId)
    .single()
  if (!profile) return []

  const { data: rolePerms } = await supabase
    .from("role_permissions")
    .select("permission_key")
    .eq("role", profile.role)

  const { data: userPerms } = await supabase
    .from("user_permissions")
    .select("permission_key, granted")
    .eq("user_id", userId)

  const perms = new Set((rolePerms || []).map((p: any) => p.permission_key))
  for (const up of userPerms || []) {
    if (up.granted) perms.add(up.permission_key)
    else perms.delete(up.permission_key)
  }
  return Array.from(perms)
}

export async function updateUserPermissions(userId: string, overrides: { key: string; granted: boolean }[]) {
  const supabase = await createClient()
  await supabase.from("user_permissions").delete().eq("user_id", userId)
  if (overrides.length === 0) return { success: true }
  const { error } = await supabase.from("user_permissions").insert(
    overrides.map(o => ({ user_id: userId, permission_key: o.key, granted: o.granted }))
  )
  if (error) return { error: error.message }
  return { success: true }
}
