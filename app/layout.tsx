import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const cairo = Cairo({ subsets: ["arabic", "latin"] });

export const metadata: Metadata = {
  title: 'TAVOC Technology - لوحة تحكم المبيعات',
  description: 'نظام إدارة مبيعات الكورسات التدريبية - TAVOC Academy',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
