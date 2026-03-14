import type { User } from "@/types/auth"
import { logAuditEvent } from "../shared/utils"
import { migrationService, UNIFIED_STORAGE_KEYS } from "./migration-service"
import { logger } from "../shared/logger"

const userDataLogger = logger.scope("UserDataService")

interface UserDataContext {
  userId: string
  organizationId?: string
}

interface EntityRecord {
  id: string
  userId: string
  [key: string]: unknown
}

type SessionRecord = {
  userId?: string
  [key: string]: unknown
}

export class UserDataService {
  private context: UserDataContext | null = null

  setContext(user: User, organizationId?: string) {
    this.context = {
      userId: user.id,
      organizationId: organizationId || user.defaultOrganizationId,
    }

    // Run migration automatically when user context is set
    this.runMigrationIfNeeded()

    logAuditEvent("user_context_set", user.id, {
      organizationId: organizationId || user.defaultOrganizationId,
      email: user.email,
    })
  }

  clearContext() {
    const previousContext = this.context
    this.context = null

    if (previousContext) {
      logAuditEvent("user_context_cleared", previousContext.userId, {
        organizationId: previousContext.organizationId,
      })
    }
  }

  getContext(): UserDataContext {
    if (!this.context) {
      throw new Error("User context not set. Please authenticate first.")
    }
    return this.context
  }

  getCurrentUser(): string | null {
    return this.context?.userId || null
  }

  private async runMigrationIfNeeded(): Promise<void> {
    try {
      if (migrationService.needsMigration()) {
        userDataLogger.info("Running automatic migration", { userId: this.context?.userId })
        const result = await migrationService.migrateToUnifiedStructure()

        if (result.success) {
          userDataLogger.info("Migration completed", { totalRecords: result.totalRecords })
        } else {
          userDataLogger.error("Migration failed", result.errors, { errors: result.errors })
        }
      }
    } catch (error) {
      userDataLogger.error("Migration error", error)
    }
  }

  // Load user-specific data from unified storage
  async loadUserData<T extends EntityRecord>(key: string): Promise<T[]> {
    try {
      const context = this.getContext()
      const data = migrationService.getUserData<T>(key, context.userId)

      logAuditEvent("data_read", context.userId, {
        resource: key,
        recordCount: data.length,
        storageKey: key, // Now using unified key
      })

      return data
    } catch (error) {
      userDataLogger.error("Error loading user data", error, { key })

      logAuditEvent("data_read_error", this.context?.userId || null, {
        resource: key,
        error: (error as Error).message,
      })

      return []
    }
  }

  // Save user-specific data to unified storage
  async saveUserData<T extends EntityRecord>(key: string, data: T[]): Promise<void> {
    try {
      const context = this.getContext()

      // Ensure all records have userId
      const dataWithUserId = data.map((record) => ({
        ...record,
        userId: record.userId || context.userId,
      })) as T[]

      migrationService.saveUserData(key, context.userId, dataWithUserId)

      logAuditEvent("data_write", context.userId, {
        resource: key,
        recordCount: dataWithUserId.length,
        storageKey: key, // Now using unified key
        dataSize: JSON.stringify(dataWithUserId).length,
      })
    } catch (error) {
      userDataLogger.error("Error saving user data", error, { key })

      logAuditEvent("data_write_error", this.context?.userId || null, {
        resource: key,
        error: (error as Error).message,
        recordCount: data.length,
      })

      throw error
    }
  }

  // Load organization-shared data (filtered by organizationId)
  async loadOrgData<T extends EntityRecord & { organizationId?: string }>(key: string): Promise<T[]> {
    try {
      const context = this.getContext()

      if (!context.organizationId) {
        // Fallback to user-specific data if no organization
        return this.loadUserData<T>(key)
      }

      // Get all data and filter by organizationId
      const stored = localStorage.getItem(key)
      const allData: T[] = stored ? JSON.parse(stored) : []
      const orgData = allData.filter((record) => record.organizationId === context.organizationId)

      logAuditEvent("org_data_read", context.userId, {
        resource: key,
        recordCount: orgData.length,
        organizationId: context.organizationId,
        storageKey: key,
      })

      return orgData
    } catch (error) {
      userDataLogger.error("Error loading organization data", error, { key })

      logAuditEvent("org_data_read_error", this.context?.userId || null, {
        resource: key,
        organizationId: this.context?.organizationId,
        error: (error as Error).message,
      })

      return []
    }
  }

  // Save organization-shared data
  async saveOrgData<T extends EntityRecord & { organizationId?: string }>(key: string, data: T[]): Promise<void> {
    try {
      const context = this.getContext()

      if (!context.organizationId) {
        // Fallback to user-specific data if no organization
        return this.saveUserData<T>(key, data)
      }

      // Get existing data
      const stored = localStorage.getItem(key)
      const allData: T[] = stored ? JSON.parse(stored) : []

      // Remove existing org data and add new data
      const otherData = allData.filter((record) => record.organizationId !== context.organizationId)
      const dataWithOrgId = data.map((record) => ({
        ...record,
        userId: record.userId || context.userId,
        organizationId: record.organizationId || context.organizationId,
      })) as T[]

      const mergedData = [...otherData, ...dataWithOrgId]
      localStorage.setItem(key, JSON.stringify(mergedData))

      logAuditEvent("org_data_write", context.userId, {
        resource: key,
        recordCount: dataWithOrgId.length,
        organizationId: context.organizationId,
        storageKey: key,
        dataSize: JSON.stringify(dataWithOrgId).length,
      })
    } catch (error) {
      userDataLogger.error("Error saving organization data", error, { key })

      logAuditEvent("org_data_write_error", this.context?.userId || null, {
        resource: key,
        organizationId: this.context?.organizationId,
        error: (error as Error).message,
        recordCount: data.length,
      })

      throw error
    }
  }

  // Check if user has access to specific data
  hasDataAccess(resourceType: string, resourceId: string, permission: "read" | "write" | "delete" = "read"): boolean {
    const context = this.getContext()

    logAuditEvent("access_control_check", context.userId, {
      resourceType,
      resourceId,
      permission,
      granted: true, // For now, users have full access to their own data
    })

    // For now, users have full access to their own data
    // In production, this would check role-based permissions
    return true
  }

  // Clean up user data on logout
  async cleanupUserData(): Promise<void> {
    if (!this.context) return

    const context = this.context
    userDataLogger.info("Cleaning up session data", { userId: context.userId })

    // Clear any temporary/session data but keep persistent user data
    const sessionKeys = ["session_logs", "temp_cache"]
    let cleanedCount = 0

    sessionKeys.forEach((key) => {
      try {
        // Clear session data from unified storage
        const stored = localStorage.getItem(key)
        if (stored) {
          const allData = JSON.parse(stored) as SessionRecord[]
          const filteredData = allData.filter((record) => record.userId !== context.userId)
          localStorage.setItem(key, JSON.stringify(filteredData))
          cleanedCount++
        }
      } catch (error) {
        userDataLogger.error("Error cleaning up session key", error, { key })
      }
    })

    logAuditEvent("user_data_cleanup", context.userId, {
      cleanedKeys: cleanedCount,
      organizationId: context.organizationId,
    })

    this.clearContext()
  }

  // Get data usage statistics for current user
  getDataUsageStats(): { [key: string]: number } {
    const context = this.getContext()
    const stats: { [key: string]: number } = {}

    // Use unified storage keys
    Object.values(UNIFIED_STORAGE_KEYS).forEach((key) => {
      try {
        const userData = migrationService.getUserData<EntityRecord>(key, context.userId)
        stats[key] = userData.length
      } catch (error) {
        userDataLogger.error("Error getting user data stats", error, { key })
        stats[key] = 0
      }
    })

    logAuditEvent("data_stats_accessed", context.userId, {
      totalRecords: Object.values(stats).reduce((sum, count) => sum + count, 0),
      stats,
    })

    return stats
  }

  // Validate user data integrity
  async validateUserDataIntegrity(): Promise<{ valid: boolean; issues: string[] }> {
    const context = this.getContext()
    return migrationService.validateDataIntegrity(context.userId)
  }

  // Export user data for backup
  async exportUserData(): Promise<Record<string, EntityRecord[]>> {
    const context = this.getContext()
    const exportData: Record<string, EntityRecord[]> = {}

    Object.entries(UNIFIED_STORAGE_KEYS).forEach(([entityName, key]) => {
      try {
        const userData = migrationService.getUserData<EntityRecord>(key, context.userId)
        exportData[entityName] = userData
      } catch (error) {
        userDataLogger.error("Error exporting entity", error, { entityName })
        exportData[entityName] = []
      }
    })

    logAuditEvent("data_export", context.userId, {
      exportedEntities: Object.keys(exportData).length,
      totalRecords: Object.values(exportData).reduce((sum, records) => sum + records.length, 0),
    })

    return exportData
  }

  // Import user data from backup
  async importUserData(
    data: Record<string, EntityRecord[]>,
    overwrite = false,
  ): Promise<{ success: boolean; errors: string[] }> {
    const context = this.getContext()
    const errors: string[] = []

    try {
      Object.entries(data).forEach(([entityName, records]) => {
        try {
          const key = UNIFIED_STORAGE_KEYS[entityName as keyof typeof UNIFIED_STORAGE_KEYS]
          if (!key) {
            errors.push(`Unknown entity: ${entityName}`)
            return
          }

          // Add userId to all records
          const recordsWithUserId = records.map((record) => ({
            ...record,
            userId: context.userId,
          }))

          if (overwrite) {
            // Replace all user data
            migrationService.saveUserData(key, context.userId, recordsWithUserId)
          } else {
            // Merge with existing data
            const existingData = migrationService.getUserData<EntityRecord>(key, context.userId)
            const existingIds = new Set(existingData.map((r) => r.id))
            const newRecords = recordsWithUserId.filter((r) => !existingIds.has(r.id))
            const mergedData = [...existingData, ...newRecords]
            migrationService.saveUserData(key, context.userId, mergedData)
          }
        } catch (error) {
          errors.push(`Failed to import ${entityName}: ${(error as Error).message}`)
        }
      })

      logAuditEvent("data_import", context.userId, {
        importedEntities: Object.keys(data).length,
        totalRecords: Object.values(data).reduce((sum, records) => sum + records.length, 0),
        overwrite,
        errors: errors.length,
      })

      return { success: errors.length === 0, errors }
    } catch (error) {
      const errorMsg = `Import failed: ${(error as Error).message}`
      errors.push(errorMsg)
      return { success: false, errors }
    }
  }
}

// Global instance
export const userDataService = new UserDataService()

// Hook for React components
export function useUserDataService() {
  return userDataService
}
