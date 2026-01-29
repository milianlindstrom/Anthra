import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyTokenOnly } from './lib/auth-server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  // Use token verification only (no database) for middleware
  const tokenPayload = await verifyTokenOnly(request)

  // Public routes that don't require auth
  const publicRoutes = ['/login', '/signup']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // If not authenticated and trying to access protected route
  if (!tokenPayload && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If authenticated and trying to access login/signup, redirect to home
  if (tokenPayload && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Note: Onboarding check is done in the page component since it requires database access
  // Middleware only checks if user has a valid token

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
