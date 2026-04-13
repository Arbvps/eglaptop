import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always update session first (refreshes tokens)
  const response = await updateSession(request)

  // Public paths - skip auth check
  if (pathname.startsWith('/login') || pathname.startsWith('/auth')) {
    return response
  }

  // Check for any Supabase auth cookie
  const hasSession = request.cookies.getAll().some(c =>
    c.name.includes('sb-') && c.name.includes('-auth-token')
  )

  if (!hasSession) {
    const loginUrl = new URL('/login', request.url)
    if (pathname !== '/') loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
