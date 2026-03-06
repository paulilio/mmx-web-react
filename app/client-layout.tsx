"use client"

import type React from "react"
import { Suspense } from "react"
import { usePathname } from "next/navigation"
import { SessionMonitor } from "@/components/auth/session-monitor"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Footer } from "@/components/layout/footer"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()

  const isPublicRoute = pathname.startsWith("/auth")

  return (
    <>
      <Suspense fallback={null}>
        {isPublicRoute ? (
          // Public routes - no auth guard needed
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        ) : (
          // Protected routes - wrap with auth guard and session monitor
          <div className="min-h-screen flex flex-col">
            <AuthGuard>
              <main className="flex-1">{children}</main>
              <SessionMonitor />
            </AuthGuard>
            <Footer />
          </div>
        )}
      </Suspense>
    </>
  )
}
