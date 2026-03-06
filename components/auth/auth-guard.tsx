"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useSession } from "@/hooks/use-session"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading: authLoading } = useAuth()
  const { isSessionValid } = useSession()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [dataInitialized, setDataInitialized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      // Wait a moment for auth to initialize
      await new Promise((resolve) => setTimeout(resolve, 100))

      if (!authLoading) {
        if (!user) {
          // No user found, redirect to auth
          router.push("/auth")
          return
        }

        if (!user.isEmailConfirmed) {
          // User exists but email not confirmed
          router.push(`/auth/confirm?email=${encodeURIComponent(user.email)}`)
          return
        }

        if (!isSessionValid) {
          // User exists but session invalid
          router.push("/auth")
          return
        }

        // All checks passed
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [user, authLoading, isSessionValid, router])

  useEffect(() => {
    const initializeData = async () => {
      if (!isChecking && user && user.isEmailConfirmed && isSessionValid && !dataInitialized) {
        // Only initialize clean data in mock mode and when user is authenticated
        if (process.env.NEXT_PUBLIC_USE_API !== "true") {
          try {
            const { initializeCleanData } = await import("../lib/storage")
            await initializeCleanData()
            console.log("[v0] Data initialized after authentication")
          } catch (error) {
            console.log("[v0] Error initializing data:", error)
          }
        }
        setDataInitialized(true)
      }
    }

    initializeData()
  }, [isChecking, user, isSessionValid, dataInitialized])

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
