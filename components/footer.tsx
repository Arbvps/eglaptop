import Link from 'next/link';
import { Phone, MapPin, MessageCircle, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900/50 border-t border-blue-400/20">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              EgLaptop
            </h3>
            <p className="text-slate-400 text-sm">
              مركز ابتكار وتجهيز العتاد الرقمي الفائق. نوفر الأجهزة التي تمنحك الأداء الحقيقي والخصوصية المطلقة.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>
                <Link href="/products" className="hover:text-blue-400 transition-colors">
                  المنتجات
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400 transition-colors">
                  اتصل بنا
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-blue-400 transition-colors">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-400 transition-colors">
                  الشروط والأحكام
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">معلومات التواصل</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <span>01145457535</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <span>01027830290</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle size={16} />
                <span>WhatsApp</span>
              </li>
            </ul>
          </div>

          {/* Address */}
          <div>
            <h4 className="font-bold mb-4">العنوان</h4>
            <div className="flex gap-2">
              <MapPin size={16} className="text-blue-400 flex-shrink-0 mt-1" />
              <p className="text-slate-400 text-sm">
                مول البستان - الدور الثالث - باب اللوق - القاهرة
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-400/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 text-sm">
              © {currentYear} EgLaptop. جميع الحقوق محفوظة.
            </p>
            <p className="text-slate-500 text-sm mt-4 md:mt-0">
              نحن لا نبيع أجهزة؛ نحن نضع القوة والسيادة بين يديك.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
