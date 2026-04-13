import { type Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'تسجيل الدخول | TAVOC Academy',
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return children
}
