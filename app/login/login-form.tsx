'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { login } from '@/lib/auth-actions'
import { Eye, EyeOff, Lock, Mail, AlertCircle, LogIn, ShieldAlert } from 'lucide-react'

export function LoginForm({ redirectTo, accountDisabled }: { redirectTo?: string; accountDisabled?: boolean }) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(accountDisabled ? 'تم تعطيل هذا الحساب. تواصل مع المدير.' : null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await login(formData)
    if (result?.error) {
      const msg = result.error === 'Invalid login credentials'
        ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
        : result.error
      setError(msg)
      setLoading(false)
    }
    // On success, login() redirects server-side
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4" dir="rtl">
      {/* Subtle grid bg */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-orange-500 to-orange-400" />

          <div className="p-8 space-y-7">
            {/* Logo + title */}
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TAVOC-Technology-p5llNxII2L1wlTMxk0AM84oCcnzsJX.png"
                  alt="TAVOC Technology"
                  width={150}
                  height={56}
                  style={{ height: '52px', width: 'auto' }}
                  priority
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">لوحة تحكم المبيعات</h1>
                <p className="text-slate-500 text-sm mt-1">سجّل دخولك للمتابعة</p>
              </div>
            </div>

            {/* Error / disabled alert */}
            {error && (
              <div className="flex items-center gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {accountDisabled ? <ShieldAlert className="size-5 shrink-0" /> : <AlertCircle className="size-5 shrink-0" />}
                <p>{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="name@tavoc.com"
                    className="w-full ps-10 pe-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all text-slate-800 placeholder:text-slate-400 text-sm"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full ps-10 pe-10 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all text-slate-800 text-sm"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-6 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold rounded-xl shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all mt-2"
              >
                {loading
                  ? <span className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <LogIn className="size-4" />
                }
                {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </button>
            </form>
          </div>

          <div className="px-8 py-3.5 bg-slate-50 border-t text-center">
            <p className="text-xs text-slate-400">
              TAVOC Technology &copy; {new Date().getFullYear()} — نظام إدارة مبيعات الأكاديمية
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
