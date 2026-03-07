import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { evaluateCorsRequest, resolveCorsOriginMatrix, resolveRuntimeEnvironment } from "./lib/server/security/cors"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api")) {
    const corsDecision = evaluateCorsRequest({
      method: request.method,
      origin: request.headers.get("origin"),
      requestHeaders: request.headers.get("access-control-request-headers"),
      environment: resolveRuntimeEnvironment(),
      originMatrix: resolveCorsOriginMatrix(),
    })

    if (!corsDecision.allowed) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "CORS_ORIGIN_BLOCKED",
            message: "Origem nao permitida",
          },
        },
        {
          status: 403,
          headers: corsDecision.headers,
        },
      )
    }

    if (request.method.toUpperCase() === "OPTIONS") {
      return new NextResponse(null, {
        status: corsDecision.status,
        headers: corsDecision.headers,
      })
    }

    const response = NextResponse.next()
    for (const [header, value] of Object.entries(corsDecision.headers)) {
      response.headers.set(header, value)
    }

    return response
  }

  // Public routes that don't require authentication
  const publicRoutes = ["/auth", "/auth/confirm"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
