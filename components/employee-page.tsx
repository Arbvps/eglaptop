"use client"

import { useState } from "react"
import { useLeads, useSales, useTasks, useTeam, useCallLogs, COURSES, TEAM_MEMBERS, type Lead, type Feedback, type FollowUp } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Users, Plus, Phone, Mail, BookOpen, ChevronRight,
  Calendar, ThumbsUp, ThumbsDown, Minus,
  CheckCircle2, Clock, XCircle, TrendingUp, Target,
  PhoneCall, MessageCircle, Video, Star, PhoneIncoming
} from "lucide-react"

// ─── Status configs ──────────────────────────────────────────────────────────

const leadStatusMap: Record<Lead['status'], { label: string; color: string }> = {
  new: { label: 'جديد', color: 'bg-slate-100 text-slate-700' },
  contacted: { label: 'تم التواصل', color: 'bg-blue-100 text-blue-700' },
  interested: { label: 'مهتم', color: 'bg-amber-100 text-amber-700' },
  enrolled: { label: 'مسجل', color: 'bg-emerald-100 text-emerald-700' },
  lost: { label: 'خسرنا', color: 'bg-red-100 text-red-700' },
}

const sentimentMap: Record<Feedback['sentiment'], { icon: typeof ThumbsUp; color: string; label: string }> = {
  positive: { icon: ThumbsUp, color: 'text-emerald-600', label: 'إيجابي' },
  neutral: { icon: Minus, color: 'text-amber-500', label: 'محايد' },
  negative: { icon: ThumbsDown, color: 'text-red-500', label: 'سلبي' },
}

const followUpTypeMap: Record<FollowUp['type'], { icon: typeof PhoneCall; label: string }> = {
  call: { icon: PhoneCall, label: 'مكالمة' },
  whatsapp: { icon: MessageCircle, label: 'واتساب' },
  email: { icon: Mail, label: 'بريد إلكتروني' },
  meeting: { icon: Video, label: 'اجتماع' },
}

// ─── Lead Card ───────────────────────────────────────────────────────────────

function LeadCard({ lead, onSelect }: { lead: Lead; onSelect: () => void }) {
  const pendingFollowUps = lead.followUps.filter(f => f.status === 'pending').length
  const lastFeedback = lead.feedback[lead.feedback.length - 1]
  const status = leadStatusMap[lead.status]

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer border-slate-200" onClick={onSelect}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 bg-gradient-to-br from-orange-400 to-orange-600">
              <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold">{lead.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-slate-800">{lead.name}</p>
              <a
                href={`sip:${lead.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-muted-foreground flex items-center gap-1 hover:text-blue-600 transition-colors"
                title="اتصال مباشر عبر MicroSIP"
              >
                <Phone className="size-3" />{lead.phone}
              </a>
            </div>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>{status.label}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <BookOpen className="size-4 text-blue-500 shrink-0" />
          <span className="truncate">{lead.interestedCourse}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="size-3" />{lead.createdAt}</span>
          <span className="text-slate-500">المصدر: {lead.source}</span>
        </div>

        {lastFeedback && (
          <div className="bg-slate-50 rounded-lg p-2 text-xs text-slate-600 line-clamp-2">
            {lastFeedback.notes}
          </div>
        )}

        <div className="flex items-center justify-between">
          {pendingFollowUps > 0 ? (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{pendingFollowUps} متابعة معلقة</span>
          ) : <span />}
          <ChevronRight className="size-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Lead Detail Modal ────────────────────────────────────────────────────────

function LeadDetailModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const { addFeedback, addFollowUp, toggleFollowUp, updateLeadStatus } = useLeads()
  const [fbForm, setFbForm] = useState({ notes: '', sentiment: 'neutral' as Feedback['sentiment'] })
  const [fuForm, setFuForm] = useState({ scheduledDate: '', notes: '', type: 'call' as FollowUp['type'], status: 'pending' as FollowUp['status'] })
  const [fbOpen, setFbOpen] = useState(false)
  const [fuOpen, setFuOpen] = useState(false)

  const handleAddFb = () => {
    if (!fbForm.notes) return
    addFeedback(lead.id, { ...fbForm, date: new Date().toISOString().split('T')[0] })
    setFbForm({ notes: '', sentiment: 'neutral' })
    setFbOpen(false)
  }

  const handleAddFu = () => {
    if (!fuForm.scheduledDate || !fuForm.notes) return
    addFollowUp(lead.id, fuForm)
    setFuForm({ scheduledDate: '', notes: '', type: 'call', status: 'pending' })
    setFuOpen(false)
  }

  const status = leadStatusMap[lead.status]

  return (
    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-lg font-bold">{lead.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xl">{lead.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>{status.label}</span>
              <span className="text-xs text-muted-foreground">{lead.interestedCourse}</span>
            </div>
          </div>
        </DialogTitle>
        <DialogDescription className="sr-only">تفاصيل الليد والفيدباك والمتابعات</DialogDescription>
      </DialogHeader>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <a
          href={`sip:${lead.phone}`}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium text-sm transition-colors"
        >
          <PhoneCall className="size-4" />
          اتصال مباشر
        </a>
        <a
          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm transition-colors"
        >
          <MessageCircle className="size-4" />
          واتساب
        </a>
      </div>

      {/* Info & Status Change */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <a href={`sip:${lead.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-blue-600 transition-colors"><Phone className="size-4" />{lead.phone}</a>
        {lead.email && <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-blue-600 transition-colors"><Mail className="size-4" />{lead.email}</a>}
        <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="size-4" />تاريخ الإضافة: {lead.createdAt}</div>
        <div className="flex items-center gap-2 text-muted-foreground"><Star className="size-4" />المصدر: {lead.source}</div>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">تغيير الحالة</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {(Object.entries(leadStatusMap) as [Lead['status'], typeof leadStatusMap[keyof typeof leadStatusMap]][]).map(([key, val]) => (
            <button
              key={key}
              onClick={() => updateLeadStatus(lead.id, key)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${lead.status === key ? val.color + ' border-current' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}
            >{val.label}</button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="feedback">
        <TabsList className="w-full">
          <TabsTrigger value="feedback" className="flex-1">الفيدباك ({lead.feedback.length})</TabsTrigger>
          <TabsTrigger value="followup" className="flex-1">المتابعات ({lead.followUps.length})</TabsTrigger>
        </TabsList>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-3">
          <div className="flex justify-end">
            <Dialog open={fbOpen} onOpenChange={setFbOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-orange-500 hover:bg-orange-600"><Plus className="size-4" />إضافة فيدباك</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>تسجيل فيدباك العميل</DialogTitle><DialogDescription>سجّل ملاحظات وتقييم ردة فعل العميل</DialogDescription></DialogHeader>
                <div className="space-y-3">
                  <div><Label>الملاحظات</Label><Textarea value={fbForm.notes} onChange={e => setFbForm({...fbForm, notes: e.target.value})} placeholder="اكتب ما قاله العميل..." rows={4} /></div>
                  <div><Label>التقييم</Label>
                    <Select value={fbForm.sentiment} onValueChange={v => setFbForm({...fbForm, sentiment: v as Feedback['sentiment']})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="positive">إيجابي</SelectItem>
                        <SelectItem value="neutral">محايد</SelectItem>
                        <SelectItem value="negative">سلبي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddFb} className="w-full bg-orange-500 hover:bg-orange-600">حفظ</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-3">
            {lead.feedback.length === 0 && <p className="text-center text-muted-foreground py-6 text-sm">لا يوجد فيدباك مسجل بعد</p>}
            {lead.feedback.map(fb => {
              const sent = sentimentMap[fb.sentiment]
              const Icon = sent.icon
              return (
                <div key={fb.id} className="border rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{fb.date}</span>
                    <div className={`flex items-center gap-1 text-xs font-medium ${sent.color}`}><Icon className="size-4" />{sent.label}</div>
                  </div>
                  <p className="text-sm text-slate-700">{fb.notes}</p>
                </div>
              )
            })}
          </div>
        </TabsContent>

        {/* Follow-up Tab */}
        <TabsContent value="followup" className="space-y-3">
          <div className="flex justify-end">
            <Dialog open={fuOpen} onOpenChange={setFuOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700"><Plus className="size-4" />إضافة متابعة</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>جدولة متابعة</DialogTitle><DialogDescription>حدد موعد ونوع التواصل مع هذا العميل</DialogDescription></DialogHeader>
                <div className="space-y-3">
                  <div><Label>تاريخ المتابعة</Label><Input type="date" value={fuForm.scheduledDate} onChange={e => setFuForm({...fuForm, scheduledDate: e.target.value})} /></div>
                  <div><Label>نوع التواصل</Label>
                    <Select value={fuForm.type} onValueChange={v => setFuForm({...fuForm, type: v as FollowUp['type']})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">مكالمة هاتفية</SelectItem>
                        <SelectItem value="whatsapp">واتساب</SelectItem>
                        <SelectItem value="email">بريد إلكتروني</SelectItem>
                        <SelectItem value="meeting">اجتماع</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>ملاحظات</Label><Textarea value={fuForm.notes} onChange={e => setFuForm({...fuForm, notes: e.target.value})} placeholder="ما الهدف من هذه المتابعة؟" rows={3} /></div>
                  <Button onClick={handleAddFu} className="w-full bg-blue-600 hover:bg-blue-700">حفظ المتابعة</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            {lead.followUps.length === 0 && <p className="text-center text-muted-foreground py-6 text-sm">لا توجد متابعات مجدولة</p>}
            {lead.followUps.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)).map(fu => {
              const typeInfo = followUpTypeMap[fu.type]
              const Icon = typeInfo.icon
              const isPast = new Date(fu.scheduledDate) < new Date() && fu.status === 'pending'
              return (
                <div key={fu.id} className={`border rounded-xl p-4 space-y-2 ${isPast ? 'border-red-200 bg-red-50' : 'bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-blue-500" />
                      <span className="text-sm font-medium">{typeInfo.label}</span>
                      <span className="text-xs text-muted-foreground">{fu.scheduledDate}</span>
                      {isPast && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">متأخر</span>}
                    </div>
                    <button
                      onClick={() => toggleFollowUp(lead.id, fu.id, fu.status)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${fu.status === 'done' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
                    >
                      {fu.status === 'done' ? <span className="flex items-center gap-1"><CheckCircle2 className="size-3" />تم</span> : 'تحديد كمنجز'}
                    </button>
                  </div>
                  <p className="text-sm text-slate-700">{fu.notes}</p>
                </div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  )
}

// ─── Employee Profile Page ────────────────────────────────────────────────────

export function EmployeePage() {
  const { leads, addLead } = useLeads()
  const { sales } = useSales()
  const { tasks } = useTasks()
  const { team } = useTeam()

  const [selectedEmployee, setSelectedEmployee] = useState<string>(TEAM_MEMBERS[0])
  const [addLeadOpen, setAddLeadOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [callLogOpen, setCallLogOpen] = useState(false)
  const [callForm, setCallForm] = useState({ callDate: new Date().toISOString().split("T")[0], callCount: "1", notes: "" })
  const [newLead, setNewLead] = useState({ name: "", phone: "", email: "", interestedCourse: "", source: "", assignedTo: selectedEmployee, status: "new" as Lead["status"] })

  const { callLogs, addCallLog } = useCallLogs(selectedEmployee)

  const empLeads = leads.filter((l) => l.assignedTo === selectedEmployee)
  const empSales = sales.filter((s) => s.salesperson === selectedEmployee)
  const empTasks = tasks.filter((t) => t.assignee === selectedEmployee || t.assignee === "الجميع")
  const empMember = team.find((m) => m.name === selectedEmployee)

  const filteredLeads = filterStatus === "all" ? empLeads : empLeads.filter((l) => l.status === filterStatus)

  const totalRevenue = empSales.reduce((sum, s) => sum + s.amount, 0)
  const pendingFollowUps = empLeads.reduce((sum, l) => sum + l.followUps.filter((f) => f.status === "pending").length, 0)
  const enrolledLeads = empLeads.filter((l) => l.status === "enrolled").length
  const conversionRate = empLeads.length > 0 ? Math.round((enrolledLeads / empLeads.length) * 100) : 0
  const todayCallLog = callLogs.find((c) => c.callDate === new Date().toISOString().split("T")[0])
  const totalCallsThisMonth = callLogs
    .filter((c) => c.callDate.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((sum, c) => sum + c.callCount, 0)

  const handleAddLead = () => {
    if (!newLead.name || !newLead.phone || !newLead.interestedCourse) return
    addLead({ ...newLead, assignedTo: selectedEmployee, createdAt: new Date().toISOString().split("T")[0] })
    setNewLead({ name: "", phone: "", email: "", interestedCourse: "", source: "", assignedTo: selectedEmployee, status: "new" })
    setAddLeadOpen(false)
  }

  const handleAddCallLog = () => {
    if (!callForm.callCount) return
    addCallLog({ employeeName: selectedEmployee, callDate: callForm.callDate, callCount: Number(callForm.callCount), notes: callForm.notes })
    setCallForm({ callDate: new Date().toISOString().split("T")[0], callCount: "1", notes: "" })
    setCallLogOpen(false)
  }

  const avatarColors = ["from-blue-500 to-blue-700", "from-emerald-500 to-emerald-700", "from-purple-500 to-purple-700", "from-orange-400 to-orange-600", "from-pink-500 to-pink-700", "from-teal-500 to-teal-700", "from-red-500 to-red-600"]
  const empIndex = TEAM_MEMBERS.indexOf(selectedEmployee as typeof TEAM_MEMBERS[number])
  const avatarColor = avatarColors[empIndex % avatarColors.length]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Users className="size-7 text-blue-600" />بروفايل الفريق</h2>
        <p className="text-muted-foreground text-sm">تتبع أداء وليدز كل موظف</p>
      </div>

      {/* Employee Selector */}
      <div className="flex flex-wrap gap-2">
        {TEAM_MEMBERS.map((member, i) => (
          <button
            key={member}
            onClick={() => setSelectedEmployee(member)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border font-medium text-sm transition-all ${
              selectedEmployee === member
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
            }`}
          >
            <span className={`size-6 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-xs font-bold`}>
              {member.charAt(0)}
            </span>
            {member}
          </button>
        ))}
      </div>

      {/* Employee Stats */}
      <div className="bg-white rounded-2xl border p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className={`size-16 rounded-2xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
            {selectedEmployee.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">{selectedEmployee}</h3>
            <p className="text-muted-foreground text-sm">مندوب مبيعات · TAVOC Academy</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{empLeads.length}</p>
            <p className="text-xs text-muted-foreground">إجمالي الليدز</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-emerald-700">{totalRevenue.toLocaleString('ar-EG')}</p>
            <p className="text-xs text-muted-foreground">الإيرادات (ج.م)</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-700">{pendingFollowUps}</p>
            <p className="text-xs text-muted-foreground">متابعات معلقة</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-purple-700">{conversionRate}%</p>
            <p className="text-xs text-muted-foreground">معدل التحويل</p>
          </div>
        </div>
        {empLeads.length > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">نسبة التحويل</span>
              <span className="font-medium">{enrolledLeads} من {empLeads.length}</span>
            </div>
            <Progress value={conversionRate} className="h-2" />
          </div>
        )}
      </div>

      {/* Leads Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h3 className="font-bold text-slate-800 text-lg">ليدز {selectedEmployee} ({empLeads.length})</h3>
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40"><SelectValue placeholder="كل الحالات" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                {Object.entries(leadStatusMap).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Dialog open={addLeadOpen} onOpenChange={setAddLeadOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700"><Plus className="size-4" />إضافة ليد</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>إضافة ليد جديد لـ {selectedEmployee}</DialogTitle><DialogDescription>أدخل بيانات العميل المحتمل لإضافته لقائمة الليدز</DialogDescription></DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><Label>الاسم</Label><Input value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} placeholder="اسم العميل المحتمل" /></div>
                  <div><Label>رقم الهاتف</Label><Input value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} placeholder="01xxxxxxxxx" /></div>
                  <div><Label>البريد الإلكتروني</Label><Input value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} placeholder="اختياري" /></div>
                  <div className="col-span-2"><Label>الكورس المهتم به</Label>
                    <Select value={newLead.interestedCourse} onValueChange={v => setNewLead({...newLead, interestedCourse: v})}>
                      <SelectTrigger><SelectValue placeholder="اختر الكورس" /></SelectTrigger>
                      <SelectContent>{COURSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>المصدر</Label>
                    <Select value={newLead.source} onValueChange={v => setNewLead({...newLead, source: v})}>
                      <SelectTrigger><SelectValue placeholder="اختر المصدر" /></SelectTrigger>
                      <SelectContent>
                        {['Facebook', 'Instagram', 'LinkedIn', 'Website', 'Referral', 'TikTok', 'Other'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>الحالة الأولية</Label>
                    <Select value={newLead.status} onValueChange={v => setNewLead({...newLead, status: v as Lead['status']})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(leadStatusMap).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2"><Button onClick={handleAddLead} className="w-full bg-blue-600 hover:bg-blue-700">إضافة الليد</Button></div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Status summary pills */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(leadStatusMap).map(([key, val]) => {
            const count = empLeads.filter(l => l.status === key).length
            return count > 0 ? (
              <button key={key} onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${val.color} ${filterStatus === key ? 'ring-2 ring-offset-1 ring-current' : 'opacity-80 hover:opacity-100'}`}>
                {val.label}: {count}
              </button>
            ) : null
          })}
        </div>

        {/* Leads Grid */}
        {filteredLeads.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="size-12 mx-auto mb-3 opacity-30" />
            <p>لا يوجد ليدز {filterStatus !== 'all' ? `بحالة "${leadStatusMap[filterStatus as Lead['status']]?.label}"` : 'لهذا الموظف'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeads.map(lead => (
              <Dialog key={lead.id}>
                <DialogTrigger asChild>
                  <div><LeadCard lead={lead} onSelect={() => setSelectedLead(lead)} /></div>
                </DialogTrigger>
                <LeadDetailModal lead={lead} onClose={() => setSelectedLead(null)} />
              </Dialog>
            ))}
          </div>
        )}
      </div>

      {/* Recent Sales & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2"><TrendingUp className="size-5 text-emerald-600" />آخر المبيعات ({empSales.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {empSales.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">لا توجد مبيعات مسجلة</p>}
            {empSales.slice(0, 5).map(sale => (
              <div key={sale.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{sale.customerName}</p>
                  <p className="text-xs text-muted-foreground">{sale.course}</p>
                </div>
                <div className="text-end">
                  <p className="font-bold text-emerald-600 text-sm">{sale.amount.toLocaleString('ar-EG')} ج.م</p>
                  <p className="text-xs text-muted-foreground">{sale.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2"><Target className="size-5 text-blue-600" />المهام ({empTasks.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {empTasks.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">لا توجد مهام مسندة</p>}
            {empTasks.slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                {task.completed
                  ? <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  : <Clock className="size-4 text-amber-500 shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${task.completed ? 'line-through text-muted-foreground' : 'text-slate-700'}`}>{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.dueDate}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${task.priority === 'high' ? 'bg-red-100 text-red-600' : task.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                  {task.priority === 'high' ? 'عالية' : task.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
