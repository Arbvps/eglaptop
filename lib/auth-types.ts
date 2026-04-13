// Client-safe: types, constants, and pure helpers only — no server imports

export type UserProfile = {
  id: string
  email: string
  full_name: string
  role: "super_admin" | "admin" | "manager" | "sales" | "viewer"
  team_member_name: string | null
  is_active: boolean
  last_login: string | null
  created_at: string
  avatar_url: string | null
  phone: string | null
  permissions: string[]
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
  { key: "sales.view",             label: "عرض المبيعات",               group: "المبيعات"   },
  { key: "sales.create",           label: "إضافة مبيعات",               group: "المبيعات"   },
  { key: "sales.edit",             label: "تعديل المبيعات",             group: "المبيعات"   },
  { key: "sales.delete",           label: "حذف المبيعات",               group: "المبيعات"   },
  { key: "sales.export",           label: "تصدير المبيعات",             group: "المبيعات"   },
  { key: "students.view",          label: "عرض الطلاب",                 group: "الطلاب"     },
  { key: "students.create",        label: "إضافة طلاب",                 group: "الطلاب"     },
  { key: "students.edit",          label: "تعديل بيانات الطلاب",        group: "الطلاب"     },
  { key: "students.delete",        label: "حذف الطلاب",                 group: "الطلاب"     },
  { key: "students.financial",     label: "إدارة المالية للطلاب",       group: "الطلاب"     },
  { key: "students.attendance",    label: "إدارة الحضور والغياب",       group: "الطلاب"     },
  { key: "leads.view",             label: "عرض الليدز",                 group: "الليدز"     },
  { key: "leads.create",           label: "إضافة ليدز",                 group: "الليدز"     },
  { key: "leads.edit",             label: "تعديل الليدز",               group: "الليدز"     },
  { key: "leads.delete",           label: "حذف الليدز",                 group: "الليدز"     },
  { key: "leads.all",              label: "عرض ليدز جميع الموظفين",     group: "الليدز"     },
  { key: "reports.view",           label: "عرض التقارير",               group: "التقارير"   },
  { key: "reports.export",         label: "تصدير التقارير",             group: "التقارير"   },
  { key: "reports.all_employees",  label: "تقارير كل الموظفين",         group: "التقارير"   },
  { key: "tasks.view",             label: "عرض المهام",                 group: "المهام"     },
  { key: "tasks.create",           label: "إضافة مهام",                 group: "المهام"     },
  { key: "tasks.edit",             label: "تعديل المهام",               group: "المهام"     },
  { key: "tasks.delete",           label: "حذف المهام",                 group: "المهام"     },
  { key: "tasks.assign",           label: "تعيين مهام للآخرين",         group: "المهام"     },
  { key: "team.view",              label: "عرض الفريق",                 group: "الفريق"     },
  { key: "team.manage",            label: "إدارة الفريق",               group: "الفريق"     },
  { key: "settings.view",          label: "عرض الإعدادات",             group: "الإعدادات"  },
  { key: "settings.edit",          label: "تعديل الإعدادات",           group: "الإعدادات"  },
  { key: "settings.integrations",  label: "إدارة التكاملات",           group: "الإعدادات"  },
  { key: "admin.users",            label: "إدارة المستخدمين",           group: "الإدارة"    },
  { key: "admin.roles",            label: "إدارة الصلاحيات",            group: "الإدارة"    },
  { key: "admin.logs",             label: "عرض سجل النشاطات",           group: "الإدارة"    },
  { key: "admin.full",             label: "صلاحيات كاملة",              group: "الإدارة"    },
]

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ALL_PERMISSIONS.map(p => p.key),
  admin:       ALL_PERMISSIONS.map(p => p.key).filter(k => k !== "admin.full"),
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
