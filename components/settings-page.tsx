'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useTeam, useStudents, COURSES } from '@/lib/store'
import { Settings, Users, BookOpen, Edit, Trash2, Phone, Link2, PhoneCall, Server, Globe, CheckCircle, AlertCircle, Headphones, Wifi } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

export function SettingsPage() {
  const { team, updateMember } = useTeam()
  const { students, updateStudent, deleteStudent } = useStudents()
  const [editingTeamMember, setEditingTeamMember] = useState<string | null>(null)
  const [editingStudent, setEditingStudent] = useState<string | null>(null)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Settings className="w-6 h-6 text-orange-500" />
        <h1 className="text-3xl font-bold">الإعدادات</h1>
      </div>

      <Tabs defaultValue="team" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="team" className="gap-2">
            <Users className="w-4 h-4" />
            فريق المبيعات
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2">
            <BookOpen className="w-4 h-4" />
            الطلاب
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Link2 className="w-4 h-4" />
            التكاملات
          </TabsTrigger>
        </TabsList>

        {/* Team Members Tab */}
        <TabsContent value="team" className="space-y-4">
          <div className="grid gap-4">
            {team.map((member) => (
              <Card key={member.id} className="border-slate-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                        {member.avatar}
                      </div>
                      <div>
                        <CardTitle>{member.name}</CardTitle>
                        <CardDescription>{member.role}</CardDescription>
                      </div>
                    </div>
                    <Dialog open={editingTeamMember === member.id} onOpenChange={(open) => !open && setEditingTeamMember(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingTeamMember(member.id)}>
                          <Edit className="w-4 h-4 me-1" />
                          تعديل
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>تعديل بيانات {member.name}</DialogTitle>
                          <DialogDescription>حدّث معلومات الموظف والأهداف والحضور</DialogDescription>
                        </DialogHeader>
                        <TeamMemberEditForm
                          member={member}
                          onSave={(target, days) => {
                            updateMember(member.name, { target, attendanceDays: days })
                            setEditingTeamMember(null)
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">الهدف الشهري</p>
                      <p className="font-bold text-lg">{member.target.toLocaleString('ar-EG')} ج.م</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">أيام الحضور</p>
                      <p className="font-bold text-lg">{member.attendanceDays}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">المبيعات</p>
                      <p className="font-bold text-lg">{member.sales.toLocaleString('ar-EG')} ج.م</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <div className="grid gap-4">
            {students.map((student) => (
              <Card key={student.id} className="border-slate-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{student.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        {student.phone}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={editingStudent === student.id} onOpenChange={(open) => !open && setEditingStudent(null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setEditingStudent(student.id)}>
                            <Edit className="w-4 h-4 me-1" />
                            تعديل
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>تعديل بيانات {student.name}</DialogTitle>
                            <DialogDescription>تحديث معلومات الطالب والكورس والرسوم</DialogDescription>
                          </DialogHeader>
                          <StudentEditForm
                            student={student}
                            onSave={(updates) => {
                              updateStudent(student.id, updates)
                              setEditingStudent(null)
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button variant="destructive" size="sm" onClick={() => deleteStudent(student.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground text-xs">الكورس</p>
                      <p className="font-semibold">{student.course}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">المندوب</p>
                      <p className="font-semibold">{student.salesperson}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">الإجمالي</p>
                      <p className="font-bold">{student.totalFees.toLocaleString('ar-EG')} ج.م</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">المدفوع</p>
                      <p className="font-bold text-emerald-600">{student.paidAmount.toLocaleString('ar-EG')} ج.م</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">المتبقي</p>
                      <p className="font-bold text-orange-600">{(student.totalFees - student.paidAmount).toLocaleString('ar-EG')} ج.م</p>
                    </div>
                  </div>
                  {student.transactions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">سجل السداد</p>
                      <div className="space-y-2">
                        {student.transactions.slice(0, 3).map((tx) => (
                          <div key={tx.id} className="flex justify-between text-xs p-2 bg-slate-50 rounded">
                            <span>{tx.date}</span>
                            <span className={tx.type === 'payment' ? 'text-emerald-600' : 'text-orange-600'}>
                              {tx.type === 'payment' ? '+' : '-'}{tx.amount.toLocaleString('ar-EG')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <IntegrationsPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Integrations Panel ──────────────────────────────────────────────────────

function IntegrationsPanel() {
  const [issabelEnabled, setIssabelEnabled] = useState(false)
  const [microsipEnabled, setMicrosipEnabled] = useState(false)
  const [issabelConfig, setIssabelConfig] = useState({
    serverUrl: '',
    apiKey: '',
    extension: '',
    username: '',
    password: ''
  })
  const [microsipConfig, setMicrosipConfig] = useState({
    sipServer: '',
    sipPort: '5060',
    sipUser: '',
    sipPassword: '',
    autoDialPrefix: ''
  })

  const handleTestIssabel = () => {
    // Placeholder for actual API test
    alert('جاري اختبار الاتصال بـ Issabel...')
  }

  const handleTestMicrosip = () => {
    // Placeholder for actual SIP test
    alert('جاري اختبار إعدادات MicroSIP...')
  }

  const handleSaveConfig = () => {
    // Save to localStorage for now, can be extended to API
    localStorage.setItem('issabel_config', JSON.stringify({ enabled: issabelEnabled, ...issabelConfig }))
    localStorage.setItem('microsip_config', JSON.stringify({ enabled: microsipEnabled, ...microsipConfig }))
    alert('تم حفظ الإعدادات بنجاح!')
  }

  return (
    <div className="space-y-6">
      {/* Issabel PBX Integration */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <Server className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Issabel PBX
                  <Badge variant={issabelEnabled ? "default" : "secondary"} className={issabelEnabled ? "bg-emerald-500" : ""}>
                    {issabelEnabled ? "مفعّل" : "معطّل"}
                  </Badge>
                </CardTitle>
                <CardDescription>نظام إدارة المكالمات والسنترال</CardDescription>
              </div>
            </div>
            <Switch checked={issabelEnabled} onCheckedChange={setIssabelEnabled} />
          </div>
        </CardHeader>
        {issabelEnabled && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>رابط سيرفر Issabel</Label>
                <Input
                  placeholder="https://issabel.company.com"
                  value={issabelConfig.serverUrl}
                  onChange={(e) => setIssabelConfig({ ...issabelConfig, serverUrl: e.target.value })}
                />
              </div>
              <div>
                <Label>API Key</Label>
                <Input
                  type="password"
                  placeholder="مفتاح API"
                  value={issabelConfig.apiKey}
                  onChange={(e) => setIssabelConfig({ ...issabelConfig, apiKey: e.target.value })}
                />
              </div>
              <div>
                <Label>رقم التحويلة (Extension)</Label>
                <Input
                  placeholder="101"
                  value={issabelConfig.extension}
                  onChange={(e) => setIssabelConfig({ ...issabelConfig, extension: e.target.value })}
                />
              </div>
              <div>
                <Label>اسم المستخدم</Label>
                <Input
                  placeholder="admin"
                  value={issabelConfig.username}
                  onChange={(e) => setIssabelConfig({ ...issabelConfig, username: e.target.value })}
                />
              </div>
              <div>
                <Label>كلمة المرور</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={issabelConfig.password}
                  onChange={(e) => setIssabelConfig({ ...issabelConfig, password: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleTestIssabel} className="gap-2">
                <Wifi className="w-4 h-4" />
                اختبار الاتصال
              </Button>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-sm">
              <p className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                مميزات التكامل مع Issabel:
              </p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• الاتصال المباشر من ملف العميل بضغطة زر</li>
                <li>• تسجيل المكالمات تلقائياً مع الليدز</li>
                <li>• عرض سجل المكالمات الواردة والصادرة</li>
                <li>• إشعارات المكالمات الفائتة</li>
                <li>• تقارير أداء المكالمات لكل موظف</li>
              </ul>
            </div>
          </CardContent>
        )}
      </Card>

      {/* MicroSIP Auto Dialer Integration */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Headphones className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  MicroSIP Auto Dialer
                  <Badge variant={microsipEnabled ? "default" : "secondary"} className={microsipEnabled ? "bg-blue-500" : ""}>
                    {microsipEnabled ? "مفعّل" : "معطّل"}
                  </Badge>
                </CardTitle>
                <CardDescription>الاتصال التلقائي عبر SIP Softphone</CardDescription>
              </div>
            </div>
            <Switch checked={microsipEnabled} onCheckedChange={setMicrosipEnabled} />
          </div>
        </CardHeader>
        {microsipEnabled && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>SIP Server</Label>
                <Input
                  placeholder="sip.company.com"
                  value={microsipConfig.sipServer}
                  onChange={(e) => setMicrosipConfig({ ...microsipConfig, sipServer: e.target.value })}
                />
              </div>
              <div>
                <Label>Port</Label>
                <Input
                  placeholder="5060"
                  value={microsipConfig.sipPort}
                  onChange={(e) => setMicrosipConfig({ ...microsipConfig, sipPort: e.target.value })}
                />
              </div>
              <div>
                <Label>SIP Username</Label>
                <Input
                  placeholder="1001"
                  value={microsipConfig.sipUser}
                  onChange={(e) => setMicrosipConfig({ ...microsipConfig, sipUser: e.target.value })}
                />
              </div>
              <div>
                <Label>SIP Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={microsipConfig.sipPassword}
                  onChange={(e) => setMicrosipConfig({ ...microsipConfig, sipPassword: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label>بادئة الاتصال التلقائي (Auto Dial Prefix)</Label>
                <Input
                  placeholder="9 للخط الخارجي"
                  value={microsipConfig.autoDialPrefix}
                  onChange={(e) => setMicrosipConfig({ ...microsipConfig, autoDialPrefix: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleTestMicrosip} className="gap-2">
                <PhoneCall className="w-4 h-4" />
                اختبار الإعدادات
              </Button>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-sm">
              <p className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                مميزات MicroSIP Auto Dialer:
              </p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• الاتصال المباشر بالنقر على رقم الهاتف</li>
                <li>• دعم بروتوكول sip: للاتصال التلقائي</li>
                <li>• تكامل مع قائمة الليدز للاتصال السريع</li>
                <li>• إحصائيات المكالمات اليومية</li>
                <li>• دعم Click-to-Call من أي مكان بالنظام</li>
              </ul>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
              <p className="font-semibold mb-1 flex items-center gap-2 text-amber-700">
                <AlertCircle className="w-4 h-4" />
                متطلبات التشغيل:
              </p>
              <ul className="space-y-1 text-amber-600">
                <li>• تثبيت برنامج MicroSIP على جهاز الكمبيوتر</li>
                <li>• تفعيل خيار "Accept URL calls" في إعدادات MicroSIP</li>
                <li>• تسجيل البروتوكول sip: في المتصفح</li>
              </ul>
            </div>
          </CardContent>
        )}
      </Card>

      {/* API Webhooks */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <CardTitle>Webhooks & API</CardTitle>
              <CardDescription>ربط النظام مع تطبيقات خارجية</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Webhook URL للمكالمات الواردة</Label>
            <Input placeholder="https://your-app.com/api/incoming-call" />
          </div>
          <div>
            <Label>Webhook URL للمكالمات الفائتة</Label>
            <Input placeholder="https://your-app.com/api/missed-call" />
          </div>
          <div>
            <Label>API Token (للتطبيقات الخارجية)</Label>
            <div className="flex gap-2">
              <Input value="tavoc_api_xxxxxxxxxxxxxxxx" readOnly className="font-mono text-sm" />
              <Button variant="outline">نسخ</Button>
              <Button variant="outline">تجديد</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">إلغاء التغييرات</Button>
        <Button onClick={handleSaveConfig} className="bg-orange-500 hover:bg-orange-600">
          حفظ جميع الإعدادات
        </Button>
      </div>
    </div>
  )
}

function TeamMemberEditForm({ member, onSave }: { member: any; onSave: (target: number, days: number) => void }) {
  const [target, setTarget] = useState(member.target.toString())
  const [days, setDays] = useState(member.attendanceDays.toString())

  return (
    <div className="space-y-4">
      <div>
        <Label>الهدف الشهري (ج.م)</Label>
        <Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
      </div>
      <div>
        <Label>أيام الحضور</Label>
        <Input type="number" value={days} onChange={(e) => setDays(e.target.value)} />
      </div>
      <Button onClick={() => onSave(Number(target), Number(days))} className="w-full bg-orange-500 hover:bg-orange-600">
        حفظ التغييرات
      </Button>
    </div>
  )
}

function StudentEditForm({ student, onSave }: { student: any; onSave: (updates: any) => void }) {
  const [name, setName] = useState(student.name)
  const [phone, setPhone] = useState(student.phone)
  const [email, setEmail] = useState(student.email)
  const [course, setCourse] = useState(student.course)
  const [totalFees, setTotalFees] = useState(student.totalFees.toString())

  return (
    <div className="space-y-4">
      <div>
        <Label>الاسم</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <Label>رقم الهاتف</Label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div>
        <Label>البريد الإلكتروني</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label>الكورس</Label>
        <select value={course} onChange={(e) => setCourse(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2">
          {COURSES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <Label>الإجمالي (ج.م)</Label>
        <Input type="number" value={totalFees} onChange={(e) => setTotalFees(e.target.value)} />
      </div>
      <Button
        onClick={() => onSave({ name, phone, email, course, totalFees: Number(totalFees) })}
        className="w-full bg-orange-500 hover:bg-orange-600"
      >
        حفظ التغييرات
      </Button>
    </div>
  )
}
