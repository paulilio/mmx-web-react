import { logger } from "../shared/logger"

interface MigrationResult {
  success: boolean
  migratedEntities: string[]
  errors: string[]
  totalRecords: number
}

interface EntityRecord {
  id: string
  userId: string
}

// Unified storage keys for the new structure
export const UNIFIED_STORAGE_KEYS = {
  users: "mmx_users",
  accounts: "mmx_accounts",
  transactions: "mmx_transactions",
  categories: "mmx_categories",
  categoryGroups: "mmx_category_groups",
  areas: "mmx_areas",
  contacts: "mmx_contacts",
  authSessions: "mmx_auth_sessions",
  auditLog: "mmx_audit_log",
} as const

// Legacy key patterns to detect
const LEGACY_KEY_PATTERNS = [
  /^mmx_areas_user_(.+)$/,
  /^mmx_category_groups_user_(.+)$/,
  /^mmx_categories_user_(.+)$/,
  /^mmx_transactions_user_(.+)$/,
  /^mmx_contacts_user_(.+)$/,
  /^mmx_accounts_user_(.+)$/,
  /^mmx_users_user_(.+)$/,
  /^mmx_auth_sessions_user_(.+)$/,
  /^mmx_audit_log_user_(.+)$/,
]

const migrationLogger = logger.scope("Migration")

class MigrationService {
  private normalizeLegacyRecordFields<T extends EntityRecord>(record: T): T {
    const normalized = { ...(record as unknown as Record<string, unknown>) }
    const legacyCategoryId = normalized.category_id

    if (typeof legacyCategoryId === "string" && typeof normalized.categoryId !== "string") {
      normalized.categoryId = legacyCategoryId
    }

    if ("category_id" in normalized) {
      delete normalized.category_id
    }

    return normalized as unknown as T
  }

  private isLocalStorageAvailable(): boolean {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return false
      }
      // Test localStorage functionality
      const testKey = "__localStorage_test__"
      localStorage.setItem(testKey, "test")
      localStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }

  private detectLegacyKeys(): { key: string; userId: string; entityType: string }[] {
    if (!this.isLocalStorageAvailable()) {
      return []
    }

    const legacyKeys: { key: string; userId: string; entityType: string }[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue

      for (const pattern of LEGACY_KEY_PATTERNS) {
        const match = key.match(pattern)
        if (match) {
          const userId = match[1]
          const entityType = key.split("_user_")[0] // Extract entity type
          if (!userId || !entityType) {
            continue
          }
          legacyKeys.push({ key, userId, entityType })
          break
        }
      }
    }

    return legacyKeys
  }

  private getUnifiedKeyForEntity(entityType: string): string | null {
    const keyMap: Record<string, string> = {
      mmx_areas: UNIFIED_STORAGE_KEYS.areas,
      mmx_category_groups: UNIFIED_STORAGE_KEYS.categoryGroups,
      mmx_categories: UNIFIED_STORAGE_KEYS.categories,
      mmx_transactions: UNIFIED_STORAGE_KEYS.transactions,
      mmx_contacts: UNIFIED_STORAGE_KEYS.contacts,
      mmx_accounts: UNIFIED_STORAGE_KEYS.accounts,
      mmx_users: UNIFIED_STORAGE_KEYS.users,
      mmx_auth_sessions: UNIFIED_STORAGE_KEYS.authSessions,
      mmx_audit_log: UNIFIED_STORAGE_KEYS.auditLog,
    }

    return keyMap[entityType] || null
  }

  private addUserIdToRecords(records: unknown[], userId: string): EntityRecord[] {
    if (!Array.isArray(records)) {
      migrationLogger.warn(`Expected array but got ${typeof records}`)
      return []
    }

    return records
      .filter((record): record is Record<string, unknown> => typeof record === "object" && record !== null)
      .map((record) =>
        this.normalizeLegacyRecordFields({
          ...record,
          userId: (record.userId as string | undefined) || userId, // Preserve existing userId if present
          id: (record.id as string | undefined) || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Ensure ID exists
        } as EntityRecord),
      )
  }

  private mergeIntoUnifiedStorage(unifiedKey: string, newRecords: EntityRecord[]): void {
    if (!this.isLocalStorageAvailable()) {
      throw new Error("localStorage not available")
    }

    try {
      // Get existing unified data
      const existingData = localStorage.getItem(unifiedKey)
      const existingRecords: EntityRecord[] = existingData ? JSON.parse(existingData) : []

      // Merge new records, avoiding duplicates by ID
      const existingIds = new Set(existingRecords.map((r) => r.id))
      const recordsToAdd = newRecords.filter((r) => !existingIds.has(r.id))

      const mergedRecords = [...existingRecords, ...recordsToAdd]

      // Save back to unified key
      localStorage.setItem(unifiedKey, JSON.stringify(mergedRecords))

      migrationLogger.info(`Merged ${recordsToAdd.length} new records into ${unifiedKey}`)
    } catch (error) {
      migrationLogger.error(`Error merging data into ${unifiedKey}`, error)
      throw error
    }
  }

  async migrateToUnifiedStructure(): Promise<MigrationResult> {
    migrationLogger.info("Starting migration to unified localStorage structure")

    const result: MigrationResult = {
      success: true,
      migratedEntities: [],
      errors: [],
      totalRecords: 0,
    }

    if (!this.isLocalStorageAvailable()) {
      result.success = false
      result.errors.push("localStorage not available")
      return result
    }

    try {
      const legacyKeys = this.detectLegacyKeys()
      migrationLogger.info(`Found ${legacyKeys.length} legacy keys to migrate`)

      if (legacyKeys.length === 0) {
        migrationLogger.info("No legacy keys found, migration not needed")
        return result
      }

      // Group legacy keys by entity type for batch processing
      const keysByEntity = legacyKeys.reduce(
        (acc, { key, userId, entityType }) => {
          if (!acc[entityType]) {
            acc[entityType] = []
          }
          acc[entityType].push({ key, userId })
          return acc
        },
        {} as Record<string, { key: string; userId: string }[]>,
      )

      // Process each entity type
      for (const [entityType, keys] of Object.entries(keysByEntity)) {
        try {
          const unifiedKey = this.getUnifiedKeyForEntity(entityType)
          if (!unifiedKey) {
            result.errors.push(`Unknown entity type: ${entityType}`)
            continue
          }

          let entityRecordCount = 0

          // Process all legacy keys for this entity type
          for (const { key, userId } of keys) {
            try {
              const legacyData = localStorage.getItem(key)
              if (!legacyData) continue

              const records = JSON.parse(legacyData)
              const recordsWithUserId = this.addUserIdToRecords(records, userId)

              if (recordsWithUserId.length > 0) {
                this.mergeIntoUnifiedStorage(unifiedKey, recordsWithUserId)
                entityRecordCount += recordsWithUserId.length
              }

              // Remove legacy key after successful migration
              localStorage.removeItem(key)
              migrationLogger.info(`Migrated and removed legacy key: ${key}`)
            } catch (error) {
              const errorMsg = `Failed to migrate key ${key}: ${(error as Error).message}`
              result.errors.push(errorMsg)
              migrationLogger.error(errorMsg)
            }
          }

          if (entityRecordCount > 0) {
            result.migratedEntities.push(entityType)
            result.totalRecords += entityRecordCount
            migrationLogger.info(`Migrated ${entityRecordCount} records for ${entityType}`)
          }
        } catch (error) {
          const errorMsg = `Failed to migrate entity ${entityType}: ${(error as Error).message}`
          result.errors.push(errorMsg)
          migrationLogger.error(errorMsg)
        }
      }

      migrationLogger.info(
        `Completed migration: ${result.migratedEntities.length} entities, ${result.totalRecords} total records`,
      )
    } catch (error) {
      result.success = false
      result.errors.push(`Migration failed: ${(error as Error).message}`)
      migrationLogger.error("Migration failed", error)
    }

    return result
  }

  // Check if migration is needed
  needsMigration(): boolean {
    return this.detectLegacyKeys().length > 0
  }

  // Get current user's data from unified structure
  getUserData<T extends EntityRecord>(entityKey: string, userId: string): T[] {
    if (!this.isLocalStorageAvailable()) {
      return []
    }

    try {
      const data = localStorage.getItem(entityKey)
      if (!data) return []

      const allRecords: T[] = JSON.parse(data)
      return allRecords.map((record) => this.normalizeLegacyRecordFields(record)).filter((record) => record.userId === userId)
    } catch (error) {
      migrationLogger.error(`Error getting user data for ${entityKey}`, error)
      return []
    }
  }

  // Save user data to unified structure
  saveUserData<T extends EntityRecord>(entityKey: string, userId: string, records: T[]): void {
    if (!this.isLocalStorageAvailable()) {
      throw new Error("localStorage not available")
    }

    try {
      // Get all existing data
      const existingData = localStorage.getItem(entityKey)
      const allRecords: T[] = existingData ? JSON.parse(existingData) : []

      // Remove existing records for this user
      const otherUsersRecords = allRecords.filter((record) => record.userId !== userId)

      // Add userId to new records if not present
      const recordsWithUserId = records.map((record) => ({
        ...record,
        userId: record.userId || userId,
      })) as T[]

      const normalizedRecords = recordsWithUserId.map((record) => this.normalizeLegacyRecordFields(record))

      // Merge and save
      const mergedRecords = [...otherUsersRecords, ...normalizedRecords]
      localStorage.setItem(entityKey, JSON.stringify(mergedRecords))

      migrationLogger.info(`Saved ${records.length} records for user ${userId} in ${entityKey}`)
    } catch (error) {
      migrationLogger.error(`Error saving user data for ${entityKey}`, error)
      throw error
    }
  }

  // Validate data integrity after migration
  validateDataIntegrity(userId: string): { valid: boolean; issues: string[] } {
    const issues: string[] = []

    try {
      // Check that all user's data has proper userId field
      Object.values(UNIFIED_STORAGE_KEYS).forEach((key) => {
        const userData = this.getUserData(key, userId)
        userData.forEach((record) => {
          if (!record.userId) {
            issues.push(`Record ${record.id} in ${key} missing userId`)
          }
          if (record.userId !== userId) {
            issues.push(`Record ${record.id} in ${key} has wrong userId: ${record.userId}`)
          }
        })
      })

      // Check referential integrity for relationships
      const transactions = this.getUserData(UNIFIED_STORAGE_KEYS.transactions, userId)
      const categories = this.getUserData(UNIFIED_STORAGE_KEYS.categories, userId)
      const categoryIds = new Set(categories.map((c) => c.id))

      transactions.forEach((tx) => {
        const txWithCategory = tx as EntityRecord & { categoryId?: string }
        const transactionCategoryId = txWithCategory.categoryId
        if (transactionCategoryId && !categoryIds.has(transactionCategoryId)) {
          issues.push(`Transaction ${tx.id} references non-existent category ${transactionCategoryId}`)
        }
      })
    } catch (error) {
      issues.push(`Validation error: ${(error as Error).message}`)
    }

    return {
      valid: issues.length === 0,
      issues,
    }
  }
}

// Export singleton instance
export const migrationService = new MigrationService()

// Auto-migration hook for React components
export function useMigration() {
  const runMigration = async (): Promise<MigrationResult> => {
    return await migrationService.migrateToUnifiedStructure()
  }

  const needsMigration = (): boolean => {
    return migrationService.needsMigration()
  }

  return {
    runMigration,
    needsMigration,
    getUserData: migrationService.getUserData.bind(migrationService),
    saveUserData: migrationService.saveUserData.bind(migrationService),
    validateDataIntegrity: migrationService.validateDataIntegrity.bind(migrationService),
  }
}
