"use client"

import { useState } from "react"
import { useStudents } from "@/lib/store"
import { COURSES, TEAM_MEMBERS, LECTURERS, type Student, type Transaction, type AttendanceRecord } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Search, Plus, User, Phone, Mail, BookOpen, 
  CreditCard, Calendar, TrendingUp, CheckCircle2, 
  XCircle, Clock, ChevronRight, GraduationCap
} from "lucide-react"

const statusMap = {
  completed: { label: 'مكتملة', color: 'bg-emerald-100 text-emerald-700' },
  pending: { label: 'معلقة', color: 'bg-amber-100 text-amber-700' },
  overdue: { label: 'متأخرة', color: 'bg-red-100 text-red-700' },
}

const attendanceMap = {
  present: { label: 'حاضر', icon: CheckCircle2, color: 'text-emerald-600' },
  absent: { label: 'غائب', icon: XCircle, color: 'text-red-500' },
  excused: { label: 'معذور', icon: Clock, color: 'text-amber-500' },
}

function StudentProfileModal({ student }: { student: Student }) {
  const { addTransaction, addAttendance } = useStudents()
  const [txOpen, setTxOpen] = useState(false)
  const [attOpen, setAttOpen] = useState(false)
  const [txForm, setTxForm] = useState({ amount: '', type: 'payment' as Transaction['type'], description: '', status: 'paid' as Transaction['status'] })
  const [attForm, setAttForm] = useState({ sessionDate: '', sessionTitle: '', lecturer: '', status: 'present' as AttendanceRecord['status'], notes: '' })

  const paymentPercent = Math.round((student.paidAmount / student.totalFees) * 100)
  const remaining = student.totalFees - student.paidAmount
  const attendanceRate = student.attendance.length > 0
    ? Math.round((student.attendance.filter(a => a.status === 'present').length / student.attendance.length) * 100)
    : 0

  const handleAddTx = () => {
    if (!txForm.amount || !txForm.description) return
    addTransaction(student.id, { ...txForm, amount: Number(txForm.amount), date: new Date().toISOString().split('T')[0] })
    setTxForm({ amount: '', type: 'payment', description: '', status: 'paid' })
    setTxOpen(false)
  }

  const handleAddAtt = () => {
    if (!attForm.sessionDate || !attForm.sessionTitle || !attForm.lecturer) return
    addAttendance(student.id, attForm)
    setAttForm({ sessionDate: '', sessionTitle: '', lecturer: '', status: 'present', notes: '' })
    setAttOpen(false)
  }

  return (
    <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3 text-xl">
          <div className="size-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-lg font-bold">
            {student.name.charAt(0)}
          </div>
          <div>
            <p>{student.name}</p>
            <p className="text-sm font-normal text-muted-foreground">{student.course}</p>
          </div>
        </DialogTitle>
        <DialogDescription className="sr-only">بروفايل الطالب والمعاملات المالية وسجل الحضور</DialogDescription>
      </DialogHeader>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">إجمالي الرسوم</p>
          <p className="font-bold text-blue-700">{student.totalFees.toLocaleString('ar-EG')} ج.م</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">المدفوع</p>
          <p className="font-bold text-emerald-700">{student.paidAmount.toLocaleString('ar-EG')} ج.م</p>
        </div>
        <div className={`rounded-xl p-3 text-center ${remaining > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
          <p className="text-xs text-muted-foreground">المتبقي</p>
          <p className={`font-bold ${remaining > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{remaining.toLocaleString('ar-EG')} ج.م</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">نسبة الحضور</p>
          <p className="font-bold text-purple-700">{attendanceRate}%</p>
        </div>
      </div>

      {/* Payment Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">نسبة السداد</span>
          <span className="font-medium">{paymentPercent}%</span>
        </div>
        <Progress value={paymentPercent} className="h-2" />
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground"><Phone className="size-4" />{student.phone}</div>
        {student.email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="size-4" />{student.email}</div>}
        <div className="flex items-center gap-2 text-muted-foreground"><User className="size-4" />المندوب: {student.salesperson}</div>
        <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="size-4" />تاريخ التسجيل: {student.enrolledDate}</div>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList className="w-full">
          <TabsTrigger value="transactions" className="flex-1">المعاملات المالية ({student.transactions.length})</TabsTrigger>
          <TabsTrigger value="attendance" className="flex-1">الحضور والغياب ({student.attendance.length})</TabsTrigger>
        </TabsList>

        {/* Transactions */}
        <TabsContent value="transactions" className="space-y-3">
          <div className="flex justify-end">
            <Dialog open={txOpen} onOpenChange={setTxOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700"><Plus className="size-4" />إضافة معاملة</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>إضافة معاملة مالية</DialogTitle><DialogDescription>أضف دفعة أو خصم أو استرداد لهذا الطالب</DialogDescription></DialogHeader>
                <div className="space-y-3">
                  <div><Label>المبلغ (ج.م)</Label><Input type="number" value={txForm.amount} onChange={e => setTxForm({...txForm, amount: e.target.value})} placeholder="0" /></div>
                  <div><Label>النوع</Label>
                    <Select value={txForm.type} onValueChange={v => setTxForm({...txForm, type: v as Transaction['type']})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="payment">دفعة</SelectItem><SelectItem value="refund">استرداد</SelectItem><SelectItem value="discount">خصم</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label>البيان</Label><Input value={txForm.description} onChange={e => setTxForm({...txForm, description: e.target.value})} placeholder="وصف المعاملة" /></div>
                  <div><Label>الحالة</Label>
                    <Select value={txForm.status} onValueChange={v => setTxForm({...txForm, status: v as Transaction['status']})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="paid">مدفوعة</SelectItem><SelectItem value="pending">معلقة</SelectItem><SelectItem value="overdue">متأخرة</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddTx} className="w-full bg-blue-600 hover:bg-blue-700">حفظ</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>التاريخ</TableHead><TableHead>البيان</TableHead><TableHead>النوع</TableHead><TableHead>المبلغ</TableHead><TableHead>الحالة</TableHead></TableRow></TableHeader>
            <TableBody>
              {student.transactions.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell className="text-sm">{tx.date}</TableCell>
                  <TableCell className="text-sm">{tx.description}</TableCell>
                  <TableCell><Badge variant="outline">{tx.type === 'payment' ? 'دفعة' : tx.type === 'refund' ? 'استرداد' : 'خصم'}</Badge></TableCell>
                  <TableCell className="font-medium">{tx.amount.toLocaleString('ar-EG')} ج.م</TableCell>
                  <TableCell><span className={`text-xs px-2 py-1 rounded-full ${statusMap[tx.status].color}`}>{statusMap[tx.status].label}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Attendance */}
        <TabsContent value="attendance" className="space-y-3">
          <div className="flex justify-end">
            <Dialog open={attOpen} onOpenChange={setAttOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700"><Plus className="size-4" />تسجيل حضور</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>تسجيل حضور/غياب</DialogTitle><DialogDescription>سجّل حضور أو غياب الطالب في هذه المحاضرة</DialogDescription></DialogHeader>
                <div className="space-y-3">
                  <div><Label>تاريخ المحاضرة</Label><Input type="date" value={attForm.sessionDate} onChange={e => setAttForm({...attForm, sessionDate: e.target.value})} /></div>
                  <div><Label>عنوان المحاضرة</Label><Input value={attForm.sessionTitle} onChange={e => setAttForm({...attForm, sessionTitle: e.target.value})} placeholder="اسم المحاضرة" /></div>
                  <div><Label>المحاضر</Label>
                    <Select value={attForm.lecturer} onValueChange={v => setAttForm({...attForm, lecturer: v})}>
                      <SelectTrigger><SelectValue placeholder="اختر المحاضر" /></SelectTrigger>
                      <SelectContent>{LECTURERS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>الحالة</Label>
                    <Select value={attForm.status} onValueChange={v => setAttForm({...attForm, status: v as AttendanceRecord['status']})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="present">حاضر</SelectItem><SelectItem value="absent">غائب</SelectItem><SelectItem value="excused">معذور</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label>ملاحظات</Label><Input value={attForm.notes} onChange={e => setAttForm({...attForm, notes: e.target.value})} placeholder="ملاحظات اختيارية" /></div>
                  <Button onClick={handleAddAtt} className="w-full bg-blue-600 hover:bg-blue-700">حفظ</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            {student.attendance.map(rec => {
              const att = attendanceMap[rec.status]
              const Icon = att.icon
              return (
                <div key={rec.id} className="flex items-center justify-between p-3 rounded-xl border bg-white">
                  <div className="flex items-center gap-3">
                    <Icon className={`size-5 ${att.color}`} />
                    <div>
                      <p className="font-medium text-sm">{rec.sessionTitle}</p>
                      <p className="text-xs text-muted-foreground">المحاضر: {rec.lecturer} · {rec.sessionDate}</p>
                      {rec.notes && <p className="text-xs text-amber-600">{rec.notes}</p>}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    rec.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                    rec.status === 'absent' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>{att.label}</span>
                </div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  )
}

export function StudentsPage() {
  const { students, isLoading, addStudent } = useStudents()
  const [search, setSearch] = useState('')
  const [filterCourse, setFilterCourse] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [newStudent, setNewStudent] = useState({
    name: '', phone: '', email: '', course: '', enrolledDate: '', salesperson: '', totalFees: '', paidAmount: ''
  })

  const filtered = students.filter(s => {
    const matchSearch = s.name.includes(search) || s.phone.includes(search) || s.course.includes(search)
    const matchCourse = filterCourse === 'all' || s.course === filterCourse
    return matchSearch && matchCourse
  })

  const handleAdd = () => {
    if (!newStudent.name || !newStudent.phone || !newStudent.course) return
    addStudent({ ...newStudent, totalFees: Number(newStudent.totalFees), paidAmount: Number(newStudent.paidAmount) })
    setNewStudent({ name: '', phone: '', email: '', course: '', enrolledDate: '', salesperson: '', totalFees: '', paidAmount: '' })
    setAddOpen(false)
  }

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">جار التحميل...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><GraduationCap className="size-7 text-blue-600" />الطلاب</h2>
          <p className="text-muted-foreground text-sm">إجمالي {students.length} طالب مسجل</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700"><Plus className="size-4" />إضافة طالب</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>إضافة طالب جديد</DialogTitle><DialogDescription>أدخل بيانات الطالب لتسجيله في الأكاديمية</DialogDescription></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>الاسم الكامل</Label><Input value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} placeholder="اسم الطالب" /></div>
              <div><Label>رقم الهاتف</Label><Input value={newStudent.phone} onChange={e => setNewStudent({...newStudent, phone: e.target.value})} placeholder="01xxxxxxxxx" /></div>
              <div><Label>البريد الإلكتروني</Label><Input value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} placeholder="email@example.com" /></div>
              <div className="col-span-2"><Label>الكورس</Label>
                <Select value={newStudent.course} onValueChange={v => setNewStudent({...newStudent, course: v})}>
                  <SelectTrigger><SelectValue placeholder="اختر الكورس" /></SelectTrigger>
                  <SelectContent>{COURSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>تاريخ التسجيل</Label><Input type="date" value={newStudent.enrolledDate} onChange={e => setNewStudent({...newStudent, enrolledDate: e.target.value})} /></div>
              <div><Label>المندوب</Label>
                <Select value={newStudent.salesperson} onValueChange={v => setNewStudent({...newStudent, salesperson: v})}>
                  <SelectTrigger><SelectValue placeholder="اختر المندوب" /></SelectTrigger>
                  <SelectContent>{TEAM_MEMBERS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>إجمالي الرسوم (ج.م)</Label><Input type="number" value={newStudent.totalFees} onChange={e => setNewStudent({...newStudent, totalFees: e.target.value})} placeholder="0" /></div>
              <div><Label>المبلغ المدفوع (ج.م)</Label><Input type="number" value={newStudent.paidAmount} onChange={e => setNewStudent({...newStudent, paidAmount: e.target.value})} placeholder="0" /></div>
              <div className="col-span-2"><Button onClick={handleAdd} className="w-full bg-blue-600 hover:bg-blue-700">حفظ الطالب</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو الهاتف أو الكورس..." className="ps-10" />
        </div>
        <Select value={filterCourse} onValueChange={setFilterCourse}>
          <SelectTrigger className="w-full sm:w-56"><SelectValue placeholder="كل الكورسات" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الكورسات</SelectItem>
            {COURSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(student => {
          const payPercent = Math.round((student.paidAmount / student.totalFees) * 100)
          const remaining = student.totalFees - student.paidAmount
          const attendanceRate = student.attendance.length > 0
            ? Math.round((student.attendance.filter(a => a.status === 'present').length / student.attendance.length) * 100)
            : 0
          return (
            <Card key={student.id} className="hover:shadow-md transition-shadow border-slate-200">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{student.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="size-3" />{student.phone}</p>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50"><ChevronRight className="size-5" /></Button>
                    </DialogTrigger>
                    <StudentProfileModal student={student} />
                  </Dialog>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="size-4 text-blue-500 shrink-0" />
                  <span className="text-slate-600 truncate">{student.course}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>السداد: {payPercent}%</span>
                    {remaining > 0 && <span className="text-red-500">متبقي {remaining.toLocaleString('ar-EG')} ج.م</span>}
                  </div>
                  <Progress value={payPercent} className="h-1.5" />
                </div>

                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground"><TrendingUp className="size-3" />الحضور: <span className="font-medium text-slate-700">{attendanceRate}%</span></div>
                  <div className="flex items-center gap-1 text-muted-foreground"><User className="size-3" />{student.salesperson}</div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <GraduationCap className="size-12 mx-auto mb-3 opacity-30" />
          <p>لا يوجد طلاب مطابقين للبحث</p>
        </div>
      )}
    </div>
  )
}
