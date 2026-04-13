import { DashboardClient } from "@/components/dashboard-client"

// Demo user for internal viewing
const DEMO_USER = {
  id: "demo-user",
  full_name: "المستخدم التجريبي",
  email: "demo@tavoc.com",
  role: "super_admin",
  is_active: true,
  created_at: new Date().toISOString(),
  permissions: [
    "sales.view", "sales.create", "sales.edit", "sales.delete", "sales.export",
    "students.view", "students.create", "students.edit", "students.delete", "students.financial", "students.attendance",
    "leads.view", "leads.create", "leads.edit", "leads.delete", "leads.all",
    "reports.view", "reports.export", "reports.all_employees",
    "tasks.view", "tasks.create", "tasks.edit", "tasks.delete", "tasks.assign",
    "team.view", "team.manage",
    "settings.view", "settings.edit", "settings.integrations",
    "admin.users", "admin.roles", "admin.logs", "admin.full"
  ]
}

export default async function Home() {
  return <DashboardClient user={DEMO_USER} />
}
