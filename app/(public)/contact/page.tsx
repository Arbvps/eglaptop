'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { addDocument } from '@/lib/firebase/database';
import { trackPageView, trackFormSubmission } from '@/lib/firebase/analytics';
import { Phone, MapPin, MessageCircle, Mail } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    trackPageView('/contact', 'Contact');
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDocument('messages', {
        ...formData,
        createdAt: new Date(),
      });
      trackFormSubmission('contact', 'success');
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Error sending message:', error);
      trackFormSubmission('contact', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h1 className="text-4xl font-bold mb-6">اتصل بنا</h1>
            <p className="text-slate-300 mb-8">
              لديك أسئلة؟ نحن هنا للمساعدة. أرسل رسالة وسنرد عليك في أقرب وقت.
            </p>

            {submitted && (
              <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-4 mb-6 text-green-300">
                شكراً لرسالتك! سنتواصل معك قريباً.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="اسمك"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 border border-blue-400/20 rounded-lg py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-400"
              />
              <input
                type="email"
                name="email"
                placeholder="بريدك الإلكتروني"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 border border-blue-400/20 rounded-lg py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-400"
              />
              <input
                type="tel"
                name="phone"
                placeholder="رقم الهاتف"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 border border-blue-400/20 rounded-lg py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-400"
              />
              <input
                type="text"
                name="subject"
                placeholder="الموضوع"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 border border-blue-400/20 rounded-lg py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-400"
              />
              <textarea
                name="message"
                placeholder="رسالتك"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full bg-slate-900 border border-blue-400/20 rounded-lg py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50"
              >
                {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold mb-8">معلومات التواصل</h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <MapPin className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-2">العنوان</h3>
                  <p className="text-slate-300">
                    مول البستان - الدور الثالث - باب اللوق - القاهرة
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Phone className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-2">الهاتف</h3>
                  <div className="space-y-1 text-slate-300">
                    <p>01145457535</p>
                    <p>01044045500</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <MessageCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-2">واتساب</h3>
                  <a
                    href="https://wa.me/201027830290"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    01027830290 ✅
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <Mail className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-2">البريد الإلكتروني</h3>
                  <a
                    href="mailto:contact@eglaptop.com"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    contact@eglaptop.com
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-12 bg-blue-900/20 border border-blue-400/20 rounded-xl p-8">
              <h3 className="font-bold mb-3">ساعات العمل</h3>
              <div className="space-y-2 text-slate-300 text-sm">
                <p>السبت - الخميس: 10:00 صباحاً - 10:00 مساءً</p>
                <p>الجمعة: 12:00 ظهراً - 10:00 مساءً</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
