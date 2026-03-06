import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/auth", "/auth/confirm"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Get session from cookies or headers (in real app, this would be more secure)
  const sessionCookie = request.cookies.get("auth_session")

  // For mock implementation, we'll check localStorage on client side
  // In production, this would validate JWT tokens or session IDs

  if (!isPublicRoute) {
    // Protected route - check if user has valid session
    // Since we can't access localStorage in middleware, we'll handle this client-side
    // This middleware mainly handles redirects and sets security headers

    const response = NextResponse.next()

    // Add security headers
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

    return response
  }

  // Public route - allow access
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
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
