import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const cairo = Cairo({ subsets: ["arabic", "latin"] });

export const metadata: Metadata = {
  title: 'EgLaptop - أجهزة الكمبيوتر الاحترافية',
  description: 'EgLaptop مركز ابتكار وتجهيز العتاد الرقمي الفائق. نوفر أحدث الأجهزة بمختلف الفئات مع ضمان الأداء والأمان.',
  openGraph: {
    title: 'EgLaptop - أجهزة الكمبيوتر الاحترافية',
    description: 'القوة.. السيادة.. ومستقبل العتاد',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className="bg-slate-950">
      <body className={`${cairo.className} antialiased bg-slate-950 text-slate-100`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
