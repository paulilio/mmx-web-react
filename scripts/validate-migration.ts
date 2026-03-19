import { migrationService, UNIFIED_STORAGE_KEYS } from "../lib/migration-service"

interface ValidationResult {
  isValid: boolean
  issues: string[]
  summary: {
    totalRecords: number
    entitiesChecked: number
    usersFound: string[]
  }
}

class MigrationValidator {
  async validateMigration(): Promise<ValidationResult> {
    const issues: string[] = []
    let totalRecords = 0
    const usersFound = new Set<string>()
    const entitiesChecked = Object.keys(UNIFIED_STORAGE_KEYS).length

    console.log("[Validator] Starting migration validation...")

    // Check each unified storage key
    for (const [entityName, storageKey] of Object.entries(UNIFIED_STORAGE_KEYS)) {
      try {
        const data = localStorage.getItem(storageKey)

        if (!data) {
          console.log(`[Validator] No data found for ${entityName} (${storageKey})`)
          continue
        }

        const records = JSON.parse(data)

        if (!Array.isArray(records)) {
          issues.push(`${entityName}: Data is not an array`)
          continue
        }

        console.log(`[Validator] Checking ${records.length} records in ${entityName}`)
        totalRecords += records.length

        // Validate each record
        records.forEach((record, index) => {
          // Check for required fields
          if (!record.id) {
            issues.push(`${entityName}[${index}]: Missing id field`)
          }

          if (!record.userId) {
            issues.push(`${entityName}[${index}]: Missing userId field`)
          } else {
            usersFound.add(record.userId)
          }

          // Check for data integrity
          if (typeof record.id !== "string") {
            issues.push(`${entityName}[${index}]: id field is not a string`)
          }

          if (typeof record.userId !== "string") {
            issues.push(`${entityName}[${index}]: userId field is not a string`)
          }
        })

        // Check for duplicate IDs within entity
        const ids = records.map((r) => r.id).filter(Boolean)
        const uniqueIds = new Set(ids)
        if (ids.length !== uniqueIds.size) {
          issues.push(`${entityName}: Contains duplicate IDs`)
        }
      } catch (error) {
        issues.push(`${entityName}: Error parsing data - ${(error as Error).message}`)
      }
    }

    // Check for orphaned legacy keys
    const legacyKeys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.includes("_user_") && key.startsWith("mmx_")) {
        legacyKeys.push(key)
      }
    }

    if (legacyKeys.length > 0) {
      issues.push(`Found ${legacyKeys.length} orphaned legacy keys: ${legacyKeys.join(", ")}`)
    }

    const result: ValidationResult = {
      isValid: issues.length === 0,
      issues,
      summary: {
        totalRecords,
        entitiesChecked,
        usersFound: Array.from(usersFound),
      },
    }

    console.log(`[Validator] Validation complete: ${result.isValid ? "VALID" : "INVALID"}`)
    console.log(`[Validator] Total records: ${totalRecords}`)
    console.log(`[Validator] Users found: ${result.summary.usersFound.length}`)
    console.log(`[Validator] Issues found: ${issues.length}`)

    if (issues.length > 0) {
      console.log("[Validator] Issues:")
      issues.forEach((issue) => console.log(`  - ${issue}`))
    }

    return result
  }

  async validateUserIsolation(userId1: string, userId2: string): Promise<boolean> {
    console.log(`[Validator] Testing isolation between ${userId1} and ${userId2}`)

    let isolationValid = true

    for (const [entityName, storageKey] of Object.entries(UNIFIED_STORAGE_KEYS)) {
      const user1Data = migrationService.getUserData(storageKey, userId1)
      const user2Data = migrationService.getUserData(storageKey, userId2)

      // Check that user1's data doesn't contain user2's records
      const user1HasUser2Data = user1Data.some((record) => record.userId === userId2)
      const user2HasUser1Data = user2Data.some((record) => record.userId === userId1)

      if (user1HasUser2Data) {
        console.log(`[Validator] ❌ ${entityName}: User ${userId1} has data belonging to ${userId2}`)
        isolationValid = false
      }

      if (user2HasUser1Data) {
        console.log(`[Validator] ❌ ${entityName}: User ${userId2} has data belonging to ${userId1}`)
        isolationValid = false
      }

      if (!user1HasUser2Data && !user2HasUser1Data) {
        console.log(`[Validator] ✅ ${entityName}: Proper isolation between users`)
      }
    }

    return isolationValid
  }

  async generateReport(): Promise<string> {
    const validation = await this.validateMigration()

    let report = "=== MIGRATION VALIDATION REPORT ===\n\n"

    report += `Status: ${validation.isValid ? "✅ VALID" : "❌ INVALID"}\n`
    report += `Total Records: ${validation.summary.totalRecords}\n`
    report += `Entities Checked: ${validation.summary.entitiesChecked}\n`
    report += `Users Found: ${validation.summary.usersFound.length}\n`
    report += `User IDs: ${validation.summary.usersFound.join(", ")}\n\n`

    if (validation.issues.length > 0) {
      report += "ISSUES FOUND:\n"
      validation.issues.forEach((issue, index) => {
        report += `${index + 1}. ${issue}\n`
      })
    } else {
      report += "No issues found. Migration is valid.\n"
    }

    report += "\n=== END REPORT ===\n"

    console.log(report)
    return report
  }
}

// Export for use in other contexts
export { MigrationValidator }

// Run validation if this script is executed directly
if (typeof window !== "undefined") {
  const validator = new MigrationValidator()
  validator.generateReport()
}
