import { withAuth } from 'next-auth/middleware'
import { NextRequest, NextResponse } from 'next/server'

export default withAuth(
  function middleware(req: NextRequest) {
    const token = req.nextauth.token
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
    const isApiAdminRoute = req.nextUrl.pathname.startsWith('/api/admin')
    const isAuthRoute = req.nextUrl.pathname.startsWith('/admin/login')

    // Allow access to auth routes
    if (isAuthRoute) {
      return NextResponse.next()
    }

    // Protect admin routes and API routes
    if ((isAdminRoute || isApiAdminRoute) && !token) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    // Check if user has admin role for protected routes
    if ((isAdminRoute || isApiAdminRoute) && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login?error=access-denied', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthRoute = req.nextUrl.pathname.startsWith('/admin/login')
        const isProtectedRoute = req.nextUrl.pathname.startsWith('/admin') || 
                                 req.nextUrl.pathname.startsWith('/api/admin')

        // Allow access to public routes and auth routes
        if (!isProtectedRoute || isAuthRoute) {
          return true
        }

        // Require token for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ],
}