'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { signOutUser } from '@/lib/firebase/auth';
import { Menu, X, LogOut, Settings } from 'lucide-react';

export default function Navbar() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await signOutUser();
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-blue-400/20">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              EgLaptop
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/products" className="text-slate-300 hover:text-blue-400 transition-colors">
              المنتجات
            </Link>
            <Link href="/contact" className="text-slate-300 hover:text-blue-400 transition-colors">
              اتصل بنا
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="text-slate-300 hover:text-blue-400 transition-colors">
                  حسابي
                </Link>
                {user.uid && (
                  <Link href="/admin" className="text-slate-300 hover:text-blue-400 transition-colors">
                    الإدارة
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-slate-300 hover:text-red-400 transition-colors flex items-center gap-2"
                >
                  <LogOut size={20} />
                  تسجيل خروج
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-slate-300 hover:text-blue-400 transition-colors"
                >
                  دخول
                </Link>
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                >
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-slate-300 hover:text-blue-400"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-blue-400/20 space-y-4">
            <Link
              href="/products"
              className="block text-slate-300 hover:text-blue-400"
              onClick={() => setIsOpen(false)}
            >
              المنتجات
            </Link>
            <Link
              href="/contact"
              className="block text-slate-300 hover:text-blue-400"
              onClick={() => setIsOpen(false)}
            >
              اتصل بنا
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block text-slate-300 hover:text-blue-400"
                  onClick={() => setIsOpen(false)}
                >
                  حسابي
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-slate-300 hover:text-red-400"
                >
                  تسجيل خروج
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block text-slate-300 hover:text-blue-400"
                  onClick={() => setIsOpen(false)}
                >
                  دخول
                </Link>
                <Link
                  href="/signup"
                  className="block bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg font-semibold text-center"
                  onClick={() => setIsOpen(false)}
                >
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
