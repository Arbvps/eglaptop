'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUpWithEmail, signInWithGoogle } from '@/lib/firebase/auth';
import { trackUserRegistration } from '@/lib/firebase/analytics';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);

    const result = await signUpWithEmail(email, password, displayName);
    if (result.success) {
      trackUserRegistration('email');
      router.push('/dashboard');
    } else {
      setError(result.error || 'فشل إنشاء الحساب');
    }
    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');

    const result = await signInWithGoogle();
    if (result.success) {
      trackUserRegistration('google');
      router.push('/dashboard');
    } else {
      setError(result.error || 'فشل إنشاء الحساب');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-slate-900 border border-blue-400/20 rounded-xl p-8">
            <h1 className="text-2xl font-bold mb-2 text-center">إنشاء حساب جديد</h1>
            <p className="text-slate-400 text-center mb-8">
              انضم إلينا للوصول إلى الأجهزة الفائقة
            </p>

            {error && (
              <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-4 mb-6 text-red-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailSignUp} className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="اسمك الكامل"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full bg-slate-800 border border-blue-400/20 rounded-lg py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-400"
              />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-800 border border-blue-400/20 rounded-lg py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-400"
              />
              <input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-800 border border-blue-400/20 rounded-lg py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-400"
              />
              <input
                type="password"
                placeholder="تأكيد كلمة المرور"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-slate-800 border border-blue-400/20 rounded-lg py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50"
              >
                {loading ? 'جاري الإنشاء...' : 'إنشاء حساب'}
              </button>
            </form>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-blue-400/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-400">أو</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full bg-slate-800 border border-blue-400/20 text-slate-100 py-3 rounded-lg font-semibold hover:bg-slate-700 transition-all disabled:opacity-50"
            >
              {loading ? 'جاري الإنشاء...' : 'إنشاء بـ Google'}
            </button>

            <p className="text-center text-slate-400 mt-6">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300">
                تسجيل دخول
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
