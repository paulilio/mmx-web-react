"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Filter } from "lucide-react"
import { formatDateToPtBR } from "@/lib/shared/date-utils"

interface AuditEvent {
  id: string
  action: string
  userId: string | null
  metadata: Record<string, unknown>
  timestamp: string
  userAgent: string
  ip: string
}

const CANONICAL_AUDIT_KEY = "mmx_audit_log"
const LEGACY_AUDIT_KEYS = ["audit_log", "audit_logs"]

function loadAuditLogsFromStorage(): AuditEvent[] {
  const canonicalData = localStorage.getItem(CANONICAL_AUDIT_KEY)
  if (canonicalData) {
    try {
      const parsed = JSON.parse(canonicalData)
      if (Array.isArray(parsed)) {
        return parsed as AuditEvent[]
      }
    } catch {
      // fallback to legacy keys
    }
  }

  for (const key of LEGACY_AUDIT_KEYS) {
    const legacyData = localStorage.getItem(key)
    if (!legacyData) {
      continue
    }

    try {
      const parsed = JSON.parse(legacyData)
      if (Array.isArray(parsed)) {
        localStorage.setItem(CANONICAL_AUDIT_KEY, JSON.stringify(parsed))
        return parsed as AuditEvent[]
      }
    } catch {
      // continue reading next key
    }
  }

  return []
}

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditEvent[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  useEffect(() => {
    // Load audit logs from localStorage
    const logs = loadAuditLogsFromStorage()
    setAuditLogs(logs.reverse()) // Show newest first
    setFilteredLogs(logs.reverse())
  }, [])

  useEffect(() => {
    let filtered = auditLogs

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          JSON.stringify(log.metadata).toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by action
    if (actionFilter !== "all") {
      filtered = filtered.filter((log) => log.action === actionFilter)
    }

    // Filter by date
    if (dateFilter !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
      }

      filtered = filtered.filter((log) => new Date(log.timestamp) >= filterDate)
    }

    setFilteredLogs(filtered)
  }, [auditLogs, searchTerm, actionFilter, dateFilter])

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "login_success":
        return "bg-green-100 text-green-800"
      case "login_failure":
        return "bg-red-100 text-red-800"
      case "user_created":
        return "bg-blue-100 text-blue-800"
      case "password_reset_requested":
        return "bg-yellow-100 text-yellow-800"
      case "organization_switched":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case "login_success":
        return "Login Realizado"
      case "login_failure":
        return "Falha no Login"
      case "user_created":
        return "Usuário Criado"
      case "password_reset_requested":
        return "Reset de Senha"
      case "organization_switched":
        return "Organização Alterada"
      default:
        return action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    }
  }

  const exportLogs = () => {
    const csvContent = [
      ["Timestamp", "Action", "User ID", "IP", "Metadata"].join(","),
      ...filteredLogs.map((log) =>
        [log.timestamp, log.action, log.userId || "N/A", log.ip, JSON.stringify(log.metadata).replace(/,/g, ";")].join(
          ",",
        ),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const uniqueActions = [...new Set(auditLogs.map((log) => log.action))]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Logs de Auditoria</h1>
        <p className="text-muted-foreground">Visualize e monitore todas as atividades do sistema</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {getActionLabel(action)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as datas</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={exportLogs} variant="outline" className="flex items-center gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{filteredLogs.length}</div>
            <p className="text-xs text-muted-foreground">Total de eventos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {filteredLogs.filter((log) => log.action === "login_success").length}
            </div>
            <p className="text-xs text-muted-foreground">Logins realizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-600">
              {filteredLogs.filter((log) => log.action === "login_failure").length}
            </div>
            <p className="text-xs text-muted-foreground">Falhas de login</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">
              {filteredLogs.filter((log) => log.action === "user_created").length}
            </div>
            <p className="text-xs text-muted-foreground">Usuários criados</p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos de Auditoria</CardTitle>
          <CardDescription>
            {filteredLogs.length} de {auditLogs.length} eventos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum evento encontrado com os filtros aplicados
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className={getActionBadgeColor(log.action)}>{getActionLabel(log.action)}</Badge>
                      <span className="text-sm text-muted-foreground">{formatDateToPtBR(log.timestamp)}</span>
                    </div>

                    <div className="text-sm">
                      <span className="font-medium">Usuário:</span> {log.userId || "Sistema"}
                    </div>

                    {Object.keys(log.metadata).length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Detalhes:</span>{" "}
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          {JSON.stringify(log.metadata, null, 2)}
                        </code>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      IP: {log.ip} • ID: {log.id}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
