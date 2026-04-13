import { NextResponse } from 'next/server'
import { verifySession, COOKIE_NAME } from './lib/auth'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Protect /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get(COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const session = await verifySession(token)
    if (!session) {
      const res = NextResponse.redirect(new URL('/login', request.url))
      res.cookies.delete(COOKIE_NAME)
      return res
    }
  }

  // Redirect logged-in users away from auth pages
  if (pathname === '/login' || pathname === '/signup') {
    const token = request.cookies.get(COOKIE_NAME)?.value
    if (token) {
      const session = await verifySession(token)
      if (session) return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
}
