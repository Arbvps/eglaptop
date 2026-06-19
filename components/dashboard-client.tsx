"use client"

import { useState } from "react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalesOverview } from "@/components/sales-overview"
import { AddSale } from "@/components/add-sale"
import { SalesTable } from "@/components/sales-table"
import { TasksPanel } from "@/components/tasks-panel"
import { TeamPerformance } from "@/components/team-performance"
import { StudentsPage } from "@/components/students-page"
import { EmployeePage } from "@/components/employee-page"
import { SettingsPage } from "@/components/settings-page"
import { AdminDashboard } from "@/components/admin-dashboard"
import { ProfilePage } from "@/components/profile-page"
import { KpiDashboard } from "@/components/kpi-dashboard"
import { ChatPage } from "@/components/chat-page"
import { ExportPanel } from "@/components/export-panel"
import { NotificationBell } from "@/components/notification-bell"
import { type UserProfile, ROLE_LABELS, ROLE_COLORS } from "@/lib/auth-types"
import { logout } from "@/lib/auth-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard, PlusCircle, FileText, CheckSquare,
  Users, GraduationCap, UserCircle2, Settings, ShieldCheck,
  LogOut, BarChart2, MessageSquare, User, Download
} from "lucide-react"

type Tab = {
  value: string
  label: string
  icon: React.ElementType
  roles: string[]
  permissions?: string[]
}

const ALL_TABS: Tab[] = [
  { value: "overview",   label: "نظرة عامة",  icon: LayoutDashboard, roles: ["super_admin","admin","manager","sales","viewer"] },
  { value: "kpi",        label: "الأداء",      icon: BarChart2,       roles: ["super_admin","admin","manager"],                  permissions: ["reports.view"] },
  { value: "add-sale",   label: "إضافة بيع",   icon: PlusCircle,      roles: ["super_admin","admin","manager","sales"],          permissions: ["sales.create"] },
  { value: "reports",    label: "التقارير",    icon: FileText,        roles: ["super_admin","admin","manager","sales","viewer"],  permissions: ["reports.view"] },
  { value: "export",     label: "تصدير",       icon: Download,        roles: ["super_admin","admin","manager"],                  permissions: ["reports.export"] },
  { value: "tasks",      label: "المهام",      icon: CheckSquare,     roles: ["super_admin","admin","manager","sales"],          permissions: ["tasks.view"] },
  { value: "team",       label: "الفريق",      icon: Users,           roles: ["super_admin","admin","manager"],                  permissions: ["team.view"] },
  { value: "students",   label: "الطلاب",      icon: GraduationCap,   roles: ["super_admin","admin","manager","sales"],          permissions: ["students.view"] },
  { value: "employees",  label: "الموظفين",    icon: UserCircle2,     roles: ["super_admin","admin","manager"],                  permissions: ["leads.view"] },
  { value: "chat",       label: "الرسائل",     icon: MessageSquare,   roles: ["super_admin","admin","manager","sales"] },
  { value: "settings",   label: "الإعدادات",   icon: Settings,        roles: ["super_admin","admin"],                           permissions: ["settings.view"] },
  { value: "admin",      label: "الإدارة",     icon: ShieldCheck,     roles: ["super_admin","admin"],                           permissions: ["admin.users"] },
  { value: "profile",    label: "حسابي",       icon: User,            roles: ["super_admin","admin","manager","sales","viewer"] },
]

function canAccess(tab: Tab, user: UserProfile) {
  if (!tab.roles.includes(user.role)) return false
  if (!tab.permissions) return true
  return tab.permissions.some(p => user.permissions.includes(p))
}

export function DashboardClient({ user }: { user: UserProfile }) {
  const visibleTabs = ALL_TABS.filter(t => canAccess(t, user))
  const [activeTab, setActiveTab] = useState(visibleTabs[0]?.value || "overview")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TAVOC-Technology-p5llNxII2L1wlTMxk0AM84oCcnzsJX.png"
                alt="TAVOC Technology"
                width={140}
                height={50}
                style={{ width: "auto", height: "48px", maxWidth: "140px" }}
              />
              <div className="hidden sm:block border-s ps-4">
                <h1 className="text-lg font-bold text-slate-800">لوحة تحكم المبيعات</h1>
                <p className="text-muted-foreground text-xs">إدارة مبيعات الكورسات التدريبية</p>
              </div>
            </div>

            {/* User info + actions */}
            <div className="flex items-center gap-2">
              <NotificationBell userId={user.id} />
              <button
                onClick={() => setActiveTab("chat")}
                className="relative size-9 flex items-center justify-center rounded-md hover:bg-slate-100 transition"
                title="الرسائل"
              >
                <MessageSquare className="size-5 text-slate-600" />
              </button>
              <div className="hidden sm:block text-end">
                <p className="text-sm font-semibold text-slate-800">{user.full_name}</p>
                <Badge className={`text-xs ${ROLE_COLORS[user.role]}`}>{ROLE_LABELS[user.role]}</Badge>
              </div>
              <button
                onClick={() => setActiveTab("profile")}
                className="size-9 rounded-full bg-gradient-to-br from-orange-400 to-blue-600 flex items-center justify-center text-white font-bold shrink-0 hover:opacity-90 transition"
                title="حسابي"
              >
                {user.full_name.charAt(0)}
              </button>
              <form action={logout}>
                <Button type="submit" variant="ghost" size="sm" className="text-slate-500 hover:text-red-500 hover:bg-red-50 gap-1.5">
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">خروج</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full justify-start h-auto flex-wrap gap-1.5 bg-white/80 backdrop-blur p-2 rounded-xl shadow-sm border">
            {visibleTabs.map(tab => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={`gap-1.5 text-sm transition-all data-[state=active]:shadow-md ${
                    tab.value === "admin"
                      ? "data-[state=active]:bg-red-600 data-[state=active]:text-white"
                      : tab.value === "profile"
                      ? "data-[state=active]:bg-slate-700 data-[state=active]:text-white"
                      : "data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  }`}
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value="overview">   <SalesOverview /> </TabsContent>
          <TabsContent value="kpi">        <KpiDashboard user={user} /> </TabsContent>
          <TabsContent value="add-sale">   <AddSale /> </TabsContent>
          <TabsContent value="reports">    <SalesTable /> </TabsContent>
          <TabsContent value="export">     <ExportPanel /> </TabsContent>
          <TabsContent value="tasks">      <TasksPanel /> </TabsContent>
          <TabsContent value="team">       <TeamPerformance /> </TabsContent>
          <TabsContent value="students">   <StudentsPage /> </TabsContent>
          <TabsContent value="employees">  <EmployeePage /> </TabsContent>
          <TabsContent value="chat">       <ChatPage currentUser={user} /> </TabsContent>
          <TabsContent value="settings">   <SettingsPage /> </TabsContent>
          <TabsContent value="admin">
            {canAccess({ value: "admin", label: "", icon: ShieldCheck, roles: ["super_admin","admin"], permissions: ["admin.users"] }, user) ? (
              <AdminDashboard currentUser={user} />
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <ShieldCheck className="size-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-semibold">ليس لديك صلاحية للوصول</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="profile">    <ProfilePage user={user} /> </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t bg-white/50 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>TAVOC Technology — نظام إدارة مبيعات الأكاديمية</p>
        </div>
      </footer>
    </div>
  )
}
