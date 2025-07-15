import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value

  // Protected routes
  const protectedRoutes = ['/dashboard', '/settings', '/admin']
  const adminRoutes = ['/admin']
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  
  const isAdminRoute = adminRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const payload = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any
      
      // Check admin access
      if (isAdminRoute && payload.subscriptionTier !== 'Admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      
    } catch (error) {
      // Invalid token
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('auth-token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*', '/admin/:path*']
}