"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/hooks/use-session"
import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Clock, RefreshCw } from "lucide-react"

export function SessionMonitor() {
  const { timeUntilExpiry, refreshSession, isSessionValid } = useSession()
  const { user } = useAuth()
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    if (timeUntilExpiry !== null && timeUntilExpiry <= 5 * 60 && timeUntilExpiry > 0) {
      setShowWarning(true)
    } else {
      setShowWarning(false)
    }
  }, [timeUntilExpiry])

  // Don't show monitor if user is not authenticated
  if (!user || !isSessionValid) {
    return null
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (!showWarning) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Alert className="border-orange-200 bg-orange-50">
        <Clock className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sessão expirando em:</p>
              <p className="text-lg font-mono">{timeUntilExpiry ? formatTime(timeUntilExpiry) : "0:00"}</p>
            </div>
            <Button size="sm" variant="outline" onClick={refreshSession} className="ml-2 bg-transparent">
              <RefreshCw className="h-3 w-3 mr-1" />
              Estender
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
