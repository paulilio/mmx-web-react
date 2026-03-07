export interface AuditEvent {
  id: string
  action: string
  userId: string | null
  organizationId?: string
  metadata: Record<string, any>
  timestamp: string
  userAgent: string
  ip: string
  severity: "low" | "medium" | "high" | "critical"
  category: "auth" | "data" | "system" | "security"
}

export class AuditLogger {
  private static instance: AuditLogger
  private maxLogSize = 10000 // Maximum number of logs to keep

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  log(
    action: string,
    userId: string | null,
    metadata: Record<string, any> = {},
    options: {
      organizationId?: string
      severity?: AuditEvent["severity"]
      category?: AuditEvent["category"]
    } = {},
  ): void {
    const auditEvent: AuditEvent = {
      id: "audit_" + Math.random().toString(36).substring(2) + Date.now().toString(36),
      action,
      userId,
      organizationId: options.organizationId,
      metadata,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "server",
      ip: "127.0.0.1", // In real app, get actual IP
      severity: options.severity || this.getSeverityFromAction(action),
      category: options.category || this.getCategoryFromAction(action),
    }

    this.persistEvent(auditEvent)
    this.handleCriticalEvents(auditEvent)

    console.log("[v0] Audit event logged:", auditEvent)
  }

  private getSeverityFromAction(action: string): AuditEvent["severity"] {
    const criticalActions = ["login_failure", "account_locked", "unauthorized_access"]
    const highActions = ["password_changed", "user_deleted", "permission_changed"]
    const mediumActions = ["login_success", "user_created", "data_exported"]

    if (criticalActions.some((a) => action.includes(a))) return "critical"
    if (highActions.some((a) => action.includes(a))) return "high"
    if (mediumActions.some((a) => action.includes(a))) return "medium"
    return "low"
  }

  private getCategoryFromAction(action: string): AuditEvent["category"] {
    if (action.includes("login") || action.includes("auth") || action.includes("password")) {
      return "auth"
    }
    if (action.includes("data") || action.includes("export") || action.includes("import")) {
      return "data"
    }
    if (action.includes("security") || action.includes("unauthorized") || action.includes("locked")) {
      return "security"
    }
    return "system"
  }

  private persistEvent(event: AuditEvent): void {
    try {
      const auditLog = JSON.parse(localStorage.getItem("audit_log") || "[]")
      auditLog.push(event)

      // Keep only the most recent events
      if (auditLog.length > this.maxLogSize) {
        auditLog.splice(0, auditLog.length - this.maxLogSize)
      }

      localStorage.setItem("audit_log", JSON.stringify(auditLog))
    } catch (error) {
      console.error("Failed to persist audit event:", error)
    }
  }

  private handleCriticalEvents(event: AuditEvent): void {
    if (event.severity === "critical") {
      // In a real application, you might:
      // - Send alerts to administrators
      // - Trigger security protocols
      // - Log to external monitoring systems
      console.warn("CRITICAL AUDIT EVENT:", event)
    }
  }

  getEvents(
    filters: {
      userId?: string
      organizationId?: string
      action?: string
      category?: AuditEvent["category"]
      severity?: AuditEvent["severity"]
      startDate?: Date
      endDate?: Date
      limit?: number
    } = {},
  ): AuditEvent[] {
    try {
      let events: AuditEvent[] = JSON.parse(localStorage.getItem("audit_log") || "[]")

      // Apply filters
      if (filters.userId) {
        events = events.filter((e) => e.userId === filters.userId)
      }
      if (filters.organizationId) {
        events = events.filter((e) => e.organizationId === filters.organizationId)
      }
      if (filters.action) {
        events = events.filter((e) => e.action === filters.action)
      }
      if (filters.category) {
        events = events.filter((e) => e.category === filters.category)
      }
      if (filters.severity) {
        events = events.filter((e) => e.severity === filters.severity)
      }
      if (filters.startDate) {
        events = events.filter((e) => new Date(e.timestamp) >= filters.startDate!)
      }
      if (filters.endDate) {
        events = events.filter((e) => new Date(e.timestamp) <= filters.endDate!)
      }

      // Sort by timestamp (newest first)
      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      // Apply limit
      if (filters.limit) {
        events = events.slice(0, filters.limit)
      }

      return events
    } catch (error) {
      console.error("Failed to retrieve audit events:", error)
      return []
    }
  }

  clearOldEvents(olderThanDays = 90): void {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

      const auditLog = JSON.parse(localStorage.getItem("audit_log") || "[]")
      const filteredLog = auditLog.filter((event: AuditEvent) => new Date(event.timestamp) > cutoffDate)

      localStorage.setItem("audit_log", JSON.stringify(filteredLog))

      this.log(
        "audit_cleanup",
        null,
        {
          removedCount: auditLog.length - filteredLog.length,
          cutoffDate: cutoffDate.toISOString(),
        },
        { category: "system", severity: "low" },
      )
    } catch (error) {
      console.error("Failed to clear old audit events:", error)
    }
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance()
