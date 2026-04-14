'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Phone, MapPin, MessageCircle, ArrowRight, Star, Shield, Zap } from 'lucide-react';
import { trackPageView, trackButtonClick } from '@/lib/firebase/analytics';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function HomePage() {
  useEffect(() => {
    trackPageView('/', 'Home');
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20" />
        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                القوة
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  السيادة ومستقبل العتاد
                </span>
              </h1>
              <p className="text-xl text-slate-300 mb-8">
                نحن لا نبيع أجهزة؛ نحن نضع القوة والسيادة بين يديك. أجهزة مجهزة برؤية تدمج بين قوة الهاردوير وأمان المستقبل.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/products"
                  onClick={() => trackButtonClick('browse-products', 'hero')}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center gap-2"
                >
                  تصفح المنتجات
                  <ArrowRight size={20} />
                </Link>
                <Link
                  href="/contact"
                  onClick={() => trackButtonClick('contact-us', 'hero')}
                  className="border border-blue-400 text-blue-400 px-8 py-4 rounded-lg font-semibold hover:bg-blue-400/10 transition-all"
                >
                  تواصل معنا
                </Link>
              </div>
            </div>
            <div className="relative h-96 hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-3xl" />
              <div className="relative bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-2xl p-8 backdrop-blur border border-blue-400/20">
                <div className="space-y-4">
                  <div className="h-32 bg-blue-800/30 rounded-lg animate-pulse" />
                  <div className="h-20 bg-blue-700/20 rounded-lg animate-pulse" />
                  <div className="h-20 bg-blue-700/20 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why EgLaptop Section */}
      <section className="py-24 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">ليه EgLaptop؟</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'معايير الفحص العالية',
                description: 'كل جهاز يتم تدقيقه لضمان سلامة "المعدن" واستقراره تحت الضغط'
              },
              {
                icon: Zap,
                title: 'تنوع العتاد',
                description: 'نوفر كل ما يحتاجه المحترفون من أحدث الأجهزة بمختلف الفئات'
              },
              {
                icon: Star,
                title: 'الهوية الرقمية',
                description: 'نمهد لأجهزتك أن تكون جزءاً من منظومة سيادية كبرى'
              }
            ].map((item, index) => (
              <div key={index} className="bg-blue-900/20 border border-blue-400/20 rounded-xl p-8 hover:border-blue-400/40 transition-all">
                <item.icon className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">فئات الأجهزة</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Professional', emoji: '💼', color: 'from-blue-500' },
              { name: 'Gaming', emoji: '🎮', color: 'from-purple-500' },
              { name: 'Business', emoji: '🏢', color: 'from-green-500' },
              { name: 'Student', emoji: '📚', color: 'from-orange-500' }
            ].map((cat) => (
              <Link
                key={cat.name}
                href={`/products?category=${cat.name}`}
                onClick={() => trackButtonClick(`category-${cat.name}`, 'categories')}
                className={`group bg-gradient-to-br ${cat.color} to-transparent p-8 rounded-xl border border-white/10 hover:border-white/30 transition-all hover:scale-105`}
              >
                <div className="text-5xl mb-4">{cat.emoji}</div>
                <h3 className="text-xl font-bold mb-2">{cat.name}</h3>
                <p className="text-white/70 group-hover:text-white/90 transition-all">
                  عرض الأجهزة
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-blue-900/30 border-y border-blue-400/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">جاهز للسيادة؟</h2>
          <p className="text-xl text-slate-300 mb-8">
            استكشف مجموعتنا الفائقة من الأجهزة وجد الجهاز المثالي لاحتياجاتك
          </p>
          <Link
            href="/products"
            onClick={() => trackButtonClick('explore-now', 'cta')}
            className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
          >
            استكشف الآن
          </Link>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">تواصل معنا</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">العنوان</h3>
              <p className="text-slate-300">
                مول البستان - الدور الثالث - باب اللوق - القاهرة
              </p>
            </div>
            <div className="text-center">
              <Phone className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">الهاتف</h3>
              <div className="space-y-1 text-slate-300">
                <p>01145457535</p>
                <p>01044045500</p>
              </div>
            </div>
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">واتساب</h3>
              <p className="text-slate-300">01027830290 ✅</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
