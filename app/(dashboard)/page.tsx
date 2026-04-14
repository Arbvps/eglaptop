'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { BarChart3, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-slate-300">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            مرحباً، {user.displayName || 'المستخدم'}
          </h1>
          <p className="text-slate-300">لوحة تحكم حسابك الشخصي</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: ShoppingCart, label: 'الطلبيات', value: '0' },
            { icon: TrendingUp, label: 'الإنفاق', value: '0 جنيه' },
            { icon: Users, label: 'العناوين المحفوظة', value: '0' },
            { icon: BarChart3, label: 'المفضلة', value: '0' }
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900 border border-blue-400/20 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <stat.icon className="w-12 h-12 text-blue-400 opacity-50" />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/dashboard/orders" className="block">
            <div className="bg-blue-900/20 border border-blue-400/20 rounded-lg p-8 hover:border-blue-400/50 transition-all cursor-pointer h-full">
              <ShoppingCart className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">طلباتي</h3>
              <p className="text-slate-300">عرض سجل الطلبات والحالة</p>
            </div>
          </Link>

          <Link href="/dashboard/wishlist" className="block">
            <div className="bg-purple-900/20 border border-purple-400/20 rounded-lg p-8 hover:border-purple-400/50 transition-all cursor-pointer h-full">
              <TrendingUp className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">المفضلة</h3>
              <p className="text-slate-300">عرض الأجهزة المفضلة لديك</p>
            </div>
          </Link>

          <Link href="/dashboard/settings" className="block">
            <div className="bg-cyan-900/20 border border-cyan-400/20 rounded-lg p-8 hover:border-cyan-400/50 transition-all cursor-pointer h-full">
              <Users className="w-12 h-12 text-cyan-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">الإعدادات</h3>
              <p className="text-slate-300">إدارة معلومات الحساب</p>
            </div>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
