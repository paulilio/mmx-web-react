"use client"

import { useEffect, useState } from "react"
import { useAuthSessions, type Session } from "@/hooks/use-auth-sessions"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, Trash2, LogOut } from "lucide-react"

/**
 * Component to display and manage user's active sessions
 */
export function SessionsList() {
  const { sessions, isLoading, error, fetchSessions, revokeSession, revokeAllOthers, clearError } =
    useAuthSessions()
  const [revoking, setRevoking] = useState<Set<string>>(new Set())
  const [revokingAll, setRevokingAll] = useState(false)

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const handleRevoke = async (sessionId: string) => {
    setRevoking((prev) => new Set(prev).add(sessionId))
    const success = await revokeSession(sessionId)
    setRevoking((prev) => {
      const next = new Set(prev)
      next.delete(sessionId)
      return next
    })
    if (!success) {
      console.error("Failed to revoke session")
    }
  }

  const handleRevokeAll = async () => {
    setRevokingAll(true)
    await revokeAllOthers()
    setRevokingAll(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">Erro ao carregar sessões</p>
            <p className="text-sm text-red-700">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="mt-2 text-red-600 hover:text-red-700"
            >
              Descartar
            </Button>
          </div>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma sessão ativa encontrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="rounded-lg border border-border bg-card p-4 flex items-start justify-between"
            >
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">
                    {session.userAgent ? parseUserAgent(session.userAgent) : "Dispositivo desconhecido"}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    Ativa
                  </span>
                </div>

                <div className="text-xs text-muted-foreground space-y-0.5">
                  {session.lastIp && <p>IP: {session.lastIp}</p>}
                  <p>Criada: {formatDate(session.createdAt)}</p>
                  <p>Última atividade: {formatDate(session.lastActivityAt)}</p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRevoke(session.id)}
                disabled={revoking.has(session.id) || isLoading}
                className="text-destructive hover:text-destructive"
              >
                {revoking.has(session.id) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      {sessions.length > 1 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-900 mb-3">
            Você tem {sessions.length} sessão(ões) ativa(s). Fazer logout em todos os outros dispositivos?
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRevokeAll}
            disabled={revokingAll || isLoading}
            className="text-amber-700 border-amber-300 hover:bg-amber-100"
          >
            {revokingAll ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Revogando...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Fazer logout em todos os outros
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * Parse user agent to extract browser/device info
 */
function parseUserAgent(userAgent: string): string {
  if (userAgent.includes("Chrome")) return "Chrome"
  if (userAgent.includes("Firefox")) return "Firefox"
  if (userAgent.includes("Safari")) return "Safari"
  if (userAgent.includes("Edge")) return "Edge"
  if (userAgent.includes("iPhone")) return "iPhone"
  if (userAgent.includes("Android")) return "Android"
  return "Dispositivo"
}

/**
 * Format ISO date to readable format
 */
function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
