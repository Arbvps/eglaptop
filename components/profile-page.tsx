'use client'

import { useState, useRef } from 'react'
import useSWR, { mutate } from 'swr'
import { createClient } from '@/lib/supabase/client'
import { type UserProfile, ROLE_LABELS, ROLE_COLORS } from '@/lib/auth-types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  User, Phone, Mail, Lock, Camera, Shield, Clock, CheckCircle, AlertCircle, Save
} from 'lucide-react'

const fetcher = async () => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('user_profiles').select('*').eq('id', user.id).single()
  return data
}

export function ProfilePage({ user }: { user: UserProfile }) {
  const { data: profile } = useSWR('profile', fetcher, { fallbackData: user })
  const [saving, setSaving] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [form, setForm] = useState({ full_name: user.full_name, phone: user.phone || '' })
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const fileRef = useRef<HTMLInputElement>(null)

  const saveProfile = async () => {
    setSaving(true); setMsg(null)
    const supabase = createClient()
    const { error } = await supabase
      .from('user_profiles')
      .update({ full_name: form.full_name, phone: form.phone })
      .eq('id', user.id)
    setSaving(false)
    setMsg(error ? { type: 'err', text: error.message } : { type: 'ok', text: 'تم حفظ البيانات بنجاح' })
    mutate('profile')
  }

  const changePassword = async () => {
    if (pwForm.next !== pwForm.confirm) {
      setPwMsg({ type: 'err', text: 'كلمتا المرور غير متطابقتين' }); return
    }
    if (pwForm.next.length < 6) {
      setPwMsg({ type: 'err', text: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }); return
    }
    setPwSaving(true); setPwMsg(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: pwForm.next })
    setPwSaving(false)
    setPwMsg(error ? { type: 'err', text: error.message } : { type: 'ok', text: 'تم تغيير كلمة المرور بنجاح' })
    if (!error) setPwForm({ current: '', next: '', confirm: '' })
  }

  const initials = (profile?.full_name || user.full_name).charAt(0)
  const roleKey = profile?.role || user.role

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Avatar + basic info */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="size-24 rounded-full bg-gradient-to-br from-orange-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {initials}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 end-0 size-8 rounded-full bg-white shadow border flex items-center justify-center hover:bg-slate-50 transition"
                title="تغيير الصورة"
              >
                <Camera className="size-4 text-slate-500" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" />
            </div>
            <div className="text-center sm:text-start space-y-1">
              <h2 className="text-2xl font-bold text-slate-800">{profile?.full_name || user.full_name}</h2>
              <p className="text-muted-foreground">{profile?.email || user.email}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <Badge className={ROLE_COLORS[roleKey]}>{ROLE_LABELS[roleKey]}</Badge>
                {profile?.team_member_name && (
                  <Badge variant="outline" className="border-orange-200 text-orange-700">{profile.team_member_name}</Badge>
                )}
                <Badge variant="outline" className={(profile?.is_active ?? true) ? 'border-emerald-200 text-emerald-700' : 'border-red-200 text-red-700'}>
                  {(profile?.is_active ?? true) ? 'نشط' : 'موقوف'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-orange-50">
          <CardContent className="pt-4 pb-4 text-center">
            <Shield className="size-6 text-orange-500 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">الصلاحيات</p>
            <p className="text-xl font-bold text-orange-600">{user.permissions.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-blue-50">
          <CardContent className="pt-4 pb-4 text-center">
            <Clock className="size-6 text-blue-500 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">آخر دخول</p>
            <p className="text-sm font-bold text-blue-600">{profile?.last_login ? new Date(profile.last_login).toLocaleDateString('ar-EG') : 'الآن'}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-emerald-50 col-span-2 sm:col-span-1">
          <CardContent className="pt-4 pb-4 text-center">
            <User className="size-6 text-emerald-500 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">عضو منذ</p>
            <p className="text-sm font-bold text-emerald-600">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ar-EG') : '-'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Personal Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><User className="size-5 text-orange-500" />البيانات الشخصية</CardTitle>
          <CardDescription>تعديل الاسم ورقم الهاتف</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>الاسم الكامل</Label>
              <div className="relative">
                <User className="absolute end-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  className="pe-9"
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>رقم الهاتف</Label>
              <div className="relative">
                <Phone className="absolute end-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  className="pe-9"
                  placeholder="01xxxxxxxxx"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute end-3 top-2.5 size-4 text-muted-foreground" />
                <Input className="pe-9 bg-slate-50" value={user.email} readOnly />
              </div>
              <p className="text-xs text-muted-foreground">لتغيير البريد تواصل مع المدير</p>
            </div>
          </div>
          {msg && (
            <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${msg.type === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {msg.type === 'ok' ? <CheckCircle className="size-4" /> : <AlertCircle className="size-4" />}
              {msg.text}
            </div>
          )}
          <Button onClick={saveProfile} disabled={saving} className="bg-orange-500 hover:bg-orange-600 gap-2">
            <Save className="size-4" />
            {saving ? 'جاري الحفظ...' : 'حفظ البيانات'}
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Lock className="size-5 text-blue-500" />تغيير كلمة المرور</CardTitle>
          <CardDescription>اختر كلمة مرور قوية لا تقل عن 8 أحرف</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>كلمة المرور الجديدة</Label>
              <Input type="password" placeholder="••••••••" value={pwForm.next} onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>تأكيد كلمة المرور الجديدة</Label>
              <Input type="password" placeholder="••••••••" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
            </div>
          </div>
          {pwMsg && (
            <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${pwMsg.type === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {pwMsg.type === 'ok' ? <CheckCircle className="size-4" /> : <AlertCircle className="size-4" />}
              {pwMsg.text}
            </div>
          )}
          <Button onClick={changePassword} disabled={pwSaving} variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 gap-2">
            <Lock className="size-4" />
            {pwSaving ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}
          </Button>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Shield className="size-5 text-slate-500" />صلاحياتي</CardTitle>
          <CardDescription>الصلاحيات المخصصة لحسابك</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {user.permissions.map(p => (
              <Badge key={p} variant="secondary" className="text-xs font-mono bg-slate-100 text-slate-600">{p}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
