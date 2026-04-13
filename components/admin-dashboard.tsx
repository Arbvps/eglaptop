'use client'

import { useState, useEffect, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Users, Shield, Activity, Plus, Edit, Trash2, Key, Eye, EyeOff,
  CheckCircle, XCircle, Clock, AlertCircle, RefreshCw, Search,
  Lock, Unlock, UserCheck, UserX, Settings2, BarChart3, LogOut
} from 'lucide-react'
import {
  ROLE_LABELS, ROLE_COLORS, ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS,
  type UserProfile
} from '@/lib/auth-types'
import { TEAM_MEMBERS } from '@/lib/store'
import { logout } from '@/lib/auth-actions'

// ─── Types ────────────────────────────────────────────────────────────────────
type ActivityLog = {
  id: string
  user_id: string
  action: string
  details: string
  created_at: string
  ip_address: string | null
  user: { full_name: string; email: string } | null
}

// ─── User Card ────────────────────────────────────────────────────────────────
function UserCard({ user, onEdit, onToggleActive, onDelete, onResetPassword, onPermissions }:
  {
    user: UserProfile
    onEdit: (u: UserProfile) => void
    onToggleActive: (id: string, active: boolean) => void
    onDelete: (id: string) => void
    onResetPassword: (id: string) => void
    onPermissions: (u: UserProfile) => void
  }) {
  return (
    <Card className={`border transition-all ${!user.is_active ? 'opacity-60 bg-slate-50' : 'bg-white hover:shadow-md'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="size-11 rounded-xl bg-gradient-to-br from-orange-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {user.full_name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-slate-800 truncate">{user.full_name}</p>
              <Badge className={`text-xs ${ROLE_COLORS[user.role]}`}>{ROLE_LABELS[user.role]}</Badge>
              {!user.is_active && <Badge variant="secondary" className="text-xs">معطّل</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate" dir="ltr">{user.email}</p>
            {user.team_member_name && (
              <p className="text-xs text-blue-600 mt-0.5">فريق: {user.team_member_name}</p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              آخر دخول: {user.last_login ? new Date(user.last_login).toLocaleDateString('ar-EG') : 'لم يسجل بعد'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => onEdit(user)} className="gap-1 text-xs h-8">
            <Edit className="size-3" />تعديل
          </Button>
          <Button variant="outline" size="sm" onClick={() => onPermissions(user)} className="gap-1 text-xs h-8">
            <Shield className="size-3" />صلاحيات
          </Button>
          <Button variant="outline" size="sm" onClick={() => onResetPassword(user.id)} className="gap-1 text-xs h-8">
            <Key className="size-3" />كلمة المرور
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={() => onToggleActive(user.id, !user.is_active)}
            className={`gap-1 text-xs h-8 ${user.is_active ? 'text-orange-600 hover:bg-orange-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
          >
            {user.is_active ? <><Lock className="size-3" />تعطيل</> : <><Unlock className="size-3" />تفعيل</>}
          </Button>
          <Button
            variant="ghost" size="sm"
            onClick={() => onDelete(user.id)}
            className="gap-1 text-xs h-8 text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="size-3" />حذف
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Permissions Editor ───────────────────────────────────────────────────────
function PermissionsEditor({ userId, userRole, currentPerms, onSave }: {
  userId: string; userRole: string; currentPerms: string[]; onSave: (overrides: { key: string; granted: boolean }[]) => void
}) {
  const roleDefaults = new Set(DEFAULT_ROLE_PERMISSIONS[userRole] || [])
  const [granted, setGranted] = useState<Set<string>>(new Set(currentPerms))
  const groups = [...new Set(ALL_PERMISSIONS.map(p => p.group))]

  const toggle = (key: string) => {
    setGranted(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const grantAll = () => setGranted(new Set(ALL_PERMISSIONS.map(p => p.key)))
  const revokeAll = () => setGranted(new Set())
  const resetToRole = () => setGranted(new Set(DEFAULT_ROLE_PERMISSIONS[userRole] || []))

  const handleSave = () => {
    const overrides: { key: string; granted: boolean }[] = []
    for (const p of ALL_PERMISSIONS) {
      const inRole = roleDefaults.has(p.key)
      const inGranted = granted.has(p.key)
      if (inRole !== inGranted) overrides.push({ key: p.key, granted: inGranted })
    }
    onSave(overrides)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={grantAll} className="text-xs">منح الكل</Button>
        <Button variant="outline" size="sm" onClick={revokeAll} className="text-xs">سحب الكل</Button>
        <Button variant="outline" size="sm" onClick={resetToRole} className="text-xs">إعادة تعيين حسب الدور</Button>
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto pe-2">
        {groups.map(group => (
          <div key={group}>
            <p className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
              <span className="h-px flex-1 bg-slate-200" />{group}<span className="h-px flex-1 bg-slate-200" />
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {ALL_PERMISSIONS.filter(p => p.group === group).map(p => {
                const isGranted = granted.has(p.key)
                const isDefault = roleDefaults.has(p.key)
                return (
                  <label key={p.key} className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${isGranted ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50 border border-transparent hover:border-slate-200'}`}>
                    <Switch checked={isGranted} onCheckedChange={() => toggle(p.key)} className="shrink-0" />
                    <span className="text-sm flex-1">{p.label}</span>
                    {isDefault && !isGranted && <Badge variant="secondary" className="text-xs">سُحب</Badge>}
                    {!isDefault && isGranted && <Badge className="text-xs bg-blue-100 text-blue-700">مضاف</Badge>}
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <Button onClick={handleSave} className="w-full bg-orange-500 hover:bg-orange-600">
        <CheckCircle className="size-4 me-2" />حفظ الصلاحيات
      </Button>
    </div>
  )
}

// ─── Main Admin Component ─────────────────────────────────────────────────────
export function AdminDashboard({ currentUser }: { currentUser: UserProfile }) {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [isPending, startTransition] = useTransition()

  // Modals
  const [addOpen, setAddOpen] = useState(false)
  const [editUser, setEditUser] = useState<UserProfile | null>(null)
  const [permUser, setPermUser] = useState<UserProfile | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [resetPwdUserId, setResetPwdUserId] = useState<string | null>(null)
  const [newPwd, setNewPwd] = useState('')
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Add User Form
  const [addForm, setAddForm] = useState({ email: '', password: '', fullName: '', role: 'sales', teamMemberName: '' })
  const [editForm, setEditForm] = useState({ fullName: '', role: 'sales', teamMemberName: '', phone: '' })

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const [usersRes, logsRes] = await Promise.all([
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/admin/logs').then(r => r.json()),
    ])
    setUsers(usersRes.users || [])
    setLogs(logsRes.logs || [])
    setLoading(false)
  }

  function showFeedback(type: 'success' | 'error', msg: string) {
    setFeedback({ type, msg })
    setTimeout(() => setFeedback(null), 4000)
  }

  async function handleAddUser() {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addForm),
    }).then(r => r.json())
    if (res.error) showFeedback('error', res.error)
    else { showFeedback('success', 'تم إنشاء المستخدم بنجاح'); setAddOpen(false); fetchData() }
  }

  async function handleUpdateUser() {
    if (!editUser) return
    const res = await fetch(`/api/admin/users/${editUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    }).then(r => r.json())
    if (res.error) showFeedback('error', res.error)
    else { showFeedback('success', 'تم تحديث بيانات المستخدم'); setEditUser(null); fetchData() }
  }

  async function handleToggleActive(id: string, active: boolean) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: active }),
    }).then(r => r.json())
    if (res.error) showFeedback('error', res.error)
    else { showFeedback('success', active ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب'); fetchData() }
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع.')) return
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' }).then(r => r.json())
    if (res.error) showFeedback('error', res.error)
    else { showFeedback('success', 'تم حذف المستخدم'); fetchData() }
  }

  async function handleResetPassword() {
    if (!resetPwdUserId || !newPwd) return
    const res = await fetch(`/api/admin/users/${resetPwdUserId}/password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPwd }),
    }).then(r => r.json())
    if (res.error) showFeedback('error', res.error)
    else { showFeedback('success', 'تم تغيير كلمة المرور'); setResetPwdUserId(null); setNewPwd('') }
  }

  async function openPermissions(u: UserProfile) {
    setPermUser(u)
    const res = await fetch(`/api/admin/users/${u.id}/permissions`).then(r => r.json())
    setPermissions(res.permissions || [])
  }

  async function handleSavePermissions(overrides: { key: string; granted: boolean }[]) {
    if (!permUser) return
    const res = await fetch(`/api/admin/users/${permUser.id}/permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ overrides }),
    }).then(r => r.json())
    if (res.error) showFeedback('error', res.error)
    else { showFeedback('success', 'تم حفظ الصلاحيات'); setPermUser(null) }
  }

  const filtered = users.filter(u => {
    const matchSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    admins: users.filter(u => ['admin', 'super_admin'].includes(u.role)).length,
    lastDay: logs.filter(l => new Date(l.created_at) > new Date(Date.now() - 86400000)).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="size-7 text-red-500" />إدارة المستخدمين والصلاحيات
          </h2>
          <p className="text-muted-foreground text-sm">تحكم كامل في حسابات المستخدمين والأدوار والأذونات</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-end text-sm">
            <p className="font-semibold text-slate-700">{currentUser.full_name}</p>
            <p className="text-xs text-muted-foreground">{ROLE_LABELS[currentUser.role]}</p>
          </div>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm" className="gap-2 text-red-500 hover:bg-red-50 border-red-200">
              <LogOut className="size-4" />خروج
            </Button>
          </form>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {feedback.type === 'success' ? <CheckCircle className="size-5 shrink-0" /> : <AlertCircle className="size-5 shrink-0" />}
          {feedback.msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي المستخدمين', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'حسابات نشطة', value: stats.active, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'المديرون', value: stats.admins, icon: Shield, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'نشاطات الـ 24 ساعة', value: stats.lastDay, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(stat => (
          <Card key={stat.label} className={`border-0 ${stat.bg}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={`size-8 ${stat.color} shrink-0`} />
              <div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="bg-white border">
          <TabsTrigger value="users" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Users className="size-4" />المستخدمون
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Shield className="size-4" />الأدوار والصلاحيات
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Activity className="size-4" />سجل النشاطات
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="بحث بالاسم أو البريد..." value={search} onChange={e => setSearch(e.target.value)} className="ps-10" />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="كل الأدوار" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأدوار</SelectItem>
                {Object.entries(ROLE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shrink-0">
                  <Plus className="size-4" />إضافة مستخدم
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                  <DialogDescription>أنشئ حساباً جديداً وحدد دوره في النظام</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div><Label>الاسم الكامل</Label><Input value={addForm.fullName} onChange={e => setAddForm({ ...addForm, fullName: e.target.value })} /></div>
                  <div><Label>البريد الإلكتروني</Label><Input type="email" dir="ltr" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} /></div>
                  <div><Label>كلمة المرور</Label><Input type="password" dir="ltr" value={addForm.password} onChange={e => setAddForm({ ...addForm, password: e.target.value })} /></div>
                  <div>
                    <Label>الدور</Label>
                    <Select value={addForm.role} onValueChange={v => setAddForm({ ...addForm, role: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(ROLE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  {addForm.role === 'sales' && (
                    <div>
                      <Label>ربط بعضو الفريق</Label>
                      <Select value={addForm.teamMemberName} onValueChange={v => setAddForm({ ...addForm, teamMemberName: v })}>
                        <SelectTrigger><SelectValue placeholder="اختر عضو الفريق" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">بدون ربط</SelectItem>
                          {TEAM_MEMBERS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Button onClick={handleAddUser} className="w-full bg-blue-600 hover:bg-blue-700">
                    <Plus className="size-4 me-2" />إنشاء الحساب
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><div className="size-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(user => (
                <UserCard key={user.id} user={user}
                  onEdit={u => { setEditUser(u); setEditForm({ fullName: u.full_name, role: u.role, teamMemberName: u.team_member_name || '', phone: u.phone || '' }) }}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDelete}
                  onResetPassword={id => setResetPwdUserId(id)}
                  onPermissions={openPermissions}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Roles & Permissions Reference Tab */}
        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(ROLE_LABELS).map(([role, label]) => {
              const perms = DEFAULT_ROLE_PERMISSIONS[role] || []
              const groups = [...new Set(ALL_PERMISSIONS.filter(p => perms.includes(p.key)).map(p => p.group))]
              return (
                <Card key={role} className="border-slate-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Badge className={`text-sm px-3 py-1 ${ROLE_COLORS[role]}`}>{label}</Badge>
                      <span className="text-sm text-muted-foreground">{perms.length} صلاحية</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {groups.map(group => (
                        <div key={group} className="space-y-1">
                          <p className="text-xs font-semibold text-slate-500 mt-2">{group}</p>
                          <div className="flex flex-wrap gap-1">
                            {ALL_PERMISSIONS.filter(p => p.group === group && perms.includes(p.key)).map(p => (
                              <span key={p.key} className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">{p.label}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="logs" className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">آخر {logs.length} نشاط في النظام</p>
            <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
              <RefreshCw className="size-4" />تحديث
            </Button>
          </div>
          <div className="space-y-2">
            {logs.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="size-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد نشاطات مسجلة</p>
              </div>
            )}
            {logs.map(log => (
              <div key={log.id} className="flex items-start gap-3 p-3 bg-white rounded-xl border hover:shadow-sm transition-shadow">
                <div className="size-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Activity className="size-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-slate-800">{log.user?.full_name || 'مستخدم محذوف'}</span>
                    <Badge variant="outline" className="text-xs">{log.action}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>
                </div>
                <div className="text-end shrink-0">
                  <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleDateString('ar-EG')}</p>
                  <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={o => !o && setEditUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل بيانات {editUser?.full_name}</DialogTitle>
            <DialogDescription>تحديث معلومات المستخدم ودوره</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>الاسم الكامل</Label><Input value={editForm.fullName} onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} /></div>
            <div><Label>رقم الهاتف</Label><Input dir="ltr" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} placeholder="+20xxxxxxxxxx" /></div>
            <div>
              <Label>الدور</Label>
              <Select value={editForm.role} onValueChange={v => setEditForm({ ...editForm, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(ROLE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {editForm.role === 'sales' && (
              <div>
                <Label>ربط بعضو الفريق</Label>
                <Select value={editForm.teamMemberName} onValueChange={v => setEditForm({ ...editForm, teamMemberName: v })}>
                  <SelectTrigger><SelectValue placeholder="اختر عضو الفريق" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">بدون ربط</SelectItem>
                    {TEAM_MEMBERS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={handleUpdateUser} className="w-full bg-blue-600 hover:bg-blue-700">حفظ التغييرات</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetPwdUserId} onOpenChange={o => !o && setResetPwdUserId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>تغيير كلمة المرور</DialogTitle>
            <DialogDescription>أدخل كلمة مرور جديدة للمستخدم</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="relative">
              <Input
                type={showNewPwd ? 'text' : 'password'}
                dir="ltr"
                placeholder="كلمة المرور الجديدة"
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                className="pe-10"
              />
              <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showNewPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <Button onClick={handleResetPassword} className="w-full bg-orange-500 hover:bg-orange-600">
              <Key className="size-4 me-2" />تغيير كلمة المرور
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={!!permUser} onOpenChange={o => !o && setPermUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>صلاحيات {permUser?.full_name}</DialogTitle>
            <DialogDescription>تخصيص الصلاحيات بشكل مستقل عن الدور المحدد</DialogDescription>
          </DialogHeader>
          {permUser && (
            <PermissionsEditor
              userId={permUser.id}
              userRole={permUser.role}
              currentPerms={permissions}
              onSave={handleSavePermissions}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
