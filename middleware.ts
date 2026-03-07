import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { evaluateCorsRequest, resolveCorsOriginMatrix, resolveRuntimeEnvironment } from "./lib/server/security/cors"

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin")
  response.headers.set("Cross-Origin-Resource-Policy", "same-site")

  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
  }

  return response
}

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
      const response = NextResponse.json(
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

      return applySecurityHeaders(response)
    }

    if (request.method.toUpperCase() === "OPTIONS") {
      const response = new NextResponse(null, {
        status: corsDecision.status,
        headers: corsDecision.headers,
      })

      return applySecurityHeaders(response)
    }

    const response = NextResponse.next()
    for (const [header, value] of Object.entries(corsDecision.headers)) {
      response.headers.set(header, value)
    }

    return applySecurityHeaders(response)
  }

  // Public routes that don't require authentication
  const publicRoutes = ["/auth", "/auth/confirm"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // For mock implementation, we'll check localStorage on client side
  // In production, this would validate JWT tokens or session IDs

  if (!isPublicRoute) {
    // Protected route - check if user has valid session
    // Since we can't access localStorage in middleware, we'll handle this client-side
    return applySecurityHeaders(NextResponse.next())
  }

  // Public route - allow access with security headers as well
  return applySecurityHeaders(NextResponse.next())
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
