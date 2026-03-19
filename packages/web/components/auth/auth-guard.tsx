"use client"

import type React from "react"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const hasRedirectedRef = useRef(false)

  const checkAuth = useCallback(() => {
    // Don't check if still loading
    if (authLoading) return

    // Don't redirect twice
    if (hasRedirectedRef.current) return

    if (!user) {
      hasRedirectedRef.current = true
      router.replace("/auth")
      return
    }

    if (!user.isEmailConfirmed) {
      hasRedirectedRef.current = true
      router.replace(`/auth/confirm?email=${encodeURIComponent(user.email)}`)
      return
    }

    // User is authenticated
    setIsChecking(false)
  }, [user, authLoading, router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Show loading state while checking authentication
  if (authLoading || isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <Skeleton className="h-4 w-32 mx-auto" />
                <Skeleton className="h-3 w-48 mx-auto" />
              </div>
              <div className="w-full space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // User is authenticated and session is valid
  return <>{children}</>
}
