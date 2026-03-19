import { migrationService, UNIFIED_STORAGE_KEYS } from "../lib/migration-service"

interface TestResult {
  testName: string
  passed: boolean
  message: string
  details?: any
}

interface TestUser {
  id: string
  email: string
  name: string
}

class MultiUserIsolationTester {
  private results: TestResult[] = []
  private testUsers: TestUser[] = [
    { id: "user-1", email: "alice@test.com", name: "Alice" },
    { id: "user-2", email: "bob@test.com", name: "Bob" },
    { id: "user-3", email: "charlie@test.com", name: "Charlie" },
  ]

  private addResult(testName: string, passed: boolean, message: string, details?: any) {
    this.results.push({ testName, passed, message, details })
    console.log(`[Test] ${testName}: ${passed ? "PASS" : "FAIL"} - ${message}`)
    if (details) {
      console.log(`[Test] Details:`, details)
    }
  }

  private clearStorage() {
    // Clear all localStorage for clean test environment
    if (typeof window !== "undefined") {
      Object.values(UNIFIED_STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key)
      })
      // Clear legacy keys that might exist
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key && key.startsWith("mmx_")) {
          localStorage.removeItem(key)
        }
      }
    }
  }

  private createLegacyData() {
    // Create legacy data structure for migration testing
    const legacyData = {
      [`mmx_transactions_user_${this.testUsers[0].id}`]: [
        { id: "tx-1", description: "Alice Transaction 1", amount: 100 },
        { id: "tx-2", description: "Alice Transaction 2", amount: 200 },
      ],
      [`mmx_transactions_user_${this.testUsers[1].id}`]: [
        { id: "tx-3", description: "Bob Transaction 1", amount: 150 },
        { id: "tx-4", description: "Bob Transaction 2", amount: 250 },
      ],
      [`mmx_categories_user_${this.testUsers[0].id}`]: [
        { id: "cat-1", name: "Alice Category 1" },
        { id: "cat-2", name: "Alice Category 2" },
      ],
      [`mmx_categories_user_${this.testUsers[1].id}`]: [{ id: "cat-3", name: "Bob Category 1" }],
    }

    Object.entries(legacyData).forEach(([key, data]) => {
      localStorage.setItem(key, JSON.stringify(data))
    })

    console.log("[Test] Created legacy data structure for migration testing")
  }

  async testMigrationDetection(): Promise<void> {
    this.clearStorage()
    this.createLegacyData()

    try {
      const needsMigration = migrationService.needsMigration()
      this.addResult(
        "Migration Detection",
        needsMigration === true,
        needsMigration ? "Legacy keys detected correctly" : "Failed to detect legacy keys",
      )
    } catch (error) {
      this.addResult("Migration Detection", false, `Error: ${(error as Error).message}`)
    }
  }

  async testMigrationExecution(): Promise<void> {
    try {
      const result = await migrationService.migrateToUnifiedStructure()

      this.addResult(
        "Migration Execution",
        result.success && result.totalRecords > 0,
        result.success
          ? `Successfully migrated ${result.totalRecords} records across ${result.migratedEntities.length} entities`
          : `Migration failed: ${result.errors.join(", ")}`,
        result,
      )

      // Verify legacy keys are removed
      let legacyKeysRemaining = 0
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.includes("_user_")) {
          legacyKeysRemaining++
        }
      }

      this.addResult(
        "Legacy Key Cleanup",
        legacyKeysRemaining === 0,
        legacyKeysRemaining === 0
          ? "All legacy keys removed successfully"
          : `${legacyKeysRemaining} legacy keys still remain`,
      )
    } catch (error) {
      this.addResult("Migration Execution", false, `Error: ${(error as Error).message}`)
    }
  }

  async testUserDataIsolation(): Promise<void> {
    try {
      // Test data isolation for each user
      for (const user of this.testUsers) {
        const userData = migrationService.getUserData(UNIFIED_STORAGE_KEYS.transactions, user.id)
        const expectedCount = user.id === "user-1" ? 2 : user.id === "user-2" ? 2 : 0

        this.addResult(
          `User Isolation - ${user.name}`,
          userData.length === expectedCount,
          `${user.name} has ${userData.length} transactions (expected: ${expectedCount})`,
          { userId: user.id, transactions: userData },
        )

        // Verify all records have correct userId
        const allHaveUserId = userData.every((record) => record.userId === user.id)
        this.addResult(
          `UserId Validation - ${user.name}`,
          allHaveUserId,
          allHaveUserId ? "All records have correct userId" : "Some records missing or incorrect userId",
        )
      }
    } catch (error) {
      this.addResult("User Data Isolation", false, `Error: ${(error as Error).message}`)
    }
  }

  async testCrossUserAccessPrevention(): Promise<void> {
    try {
      // Try to access user-1's data as user-2
      const user1Data = migrationService.getUserData(UNIFIED_STORAGE_KEYS.transactions, this.testUsers[0].id)
      const user2Data = migrationService.getUserData(UNIFIED_STORAGE_KEYS.transactions, this.testUsers[1].id)

      // Verify no cross-contamination
      const user1HasUser2Data = user1Data.some((record) => record.userId === this.testUsers[1].id)
      const user2HasUser1Data = user2Data.some((record) => record.userId === this.testUsers[0].id)

      this.addResult(
        "Cross-User Access Prevention",
        !user1HasUser2Data && !user2HasUser1Data,
        !user1HasUser2Data && !user2HasUser1Data
          ? "No cross-user data contamination detected"
          : "Cross-user data contamination found",
        {
          user1HasUser2Data,
          user2HasUser1Data,
          user1DataCount: user1Data.length,
          user2DataCount: user2Data.length,
        },
      )
    } catch (error) {
      this.addResult("Cross-User Access Prevention", false, `Error: ${(error as Error).message}`)
    }
  }

  async testDataIntegrity(): Promise<void> {
    try {
      for (const user of this.testUsers.slice(0, 2)) {
        // Only test users with data
        const integrity = migrationService.validateDataIntegrity(user.id)

        this.addResult(
          `Data Integrity - ${user.name}`,
          integrity.valid,
          integrity.valid ? "Data integrity validated" : `Integrity issues: ${integrity.issues.join(", ")}`,
          integrity,
        )
      }
    } catch (error) {
      this.addResult("Data Integrity", false, `Error: ${(error as Error).message}`)
    }
  }

  async testUnifiedStorageStructure(): Promise<void> {
    try {
      // Verify unified storage keys exist and contain data
      const transactionsData = localStorage.getItem(UNIFIED_STORAGE_KEYS.transactions)
      const categoriesData = localStorage.getItem(UNIFIED_STORAGE_KEYS.categories)

      const transactionsExist = transactionsData !== null
      const categoriesExist = categoriesData !== null

      this.addResult(
        "Unified Storage Structure",
        transactionsExist && categoriesExist,
        `Unified keys exist - Transactions: ${transactionsExist}, Categories: ${categoriesExist}`,
      )

      if (transactionsData) {
        const transactions = JSON.parse(transactionsData)
        const allHaveUserId = transactions.every((tx: any) => tx.userId)
        const userIds = [...new Set(transactions.map((tx: any) => tx.userId))]

        this.addResult(
          "Unified Data Structure",
          allHaveUserId && userIds.length > 0,
          `All transactions have userId: ${allHaveUserId}, Unique users: ${userIds.length}`,
          { totalTransactions: transactions.length, userIds },
        )
      }
    } catch (error) {
      this.addResult("Unified Storage Structure", false, `Error: ${(error as Error).message}`)
    }
  }

  async testSaveUserData(): Promise<void> {
    try {
      // Test saving new data for a user
      const testUser = this.testUsers[2] // Charlie, who had no data initially
      const newTransactions = [
        { id: "tx-new-1", description: "Charlie New Transaction", amount: 300, userId: testUser.id },
        { id: "tx-new-2", description: "Charlie Another Transaction", amount: 400, userId: testUser.id },
      ]

      migrationService.saveUserData(UNIFIED_STORAGE_KEYS.transactions, testUser.id, newTransactions)

      // Verify data was saved correctly
      const savedData = migrationService.getUserData(UNIFIED_STORAGE_KEYS.transactions, testUser.id)

      this.addResult(
        "Save User Data",
        savedData.length === 2,
        `Saved ${savedData.length} transactions for ${testUser.name} (expected: 2)`,
        { savedData },
      )

      // Verify other users' data wasn't affected
      const user1DataAfter = migrationService.getUserData(UNIFIED_STORAGE_KEYS.transactions, this.testUsers[0].id)
      const user2DataAfter = migrationService.getUserData(UNIFIED_STORAGE_KEYS.transactions, this.testUsers[1].id)

      this.addResult(
        "Data Isolation After Save",
        user1DataAfter.length === 2 && user2DataAfter.length === 2,
        `Other users' data preserved - User1: ${user1DataAfter.length}, User2: ${user2DataAfter.length}`,
      )
    } catch (error) {
      this.addResult("Save User Data", false, `Error: ${(error as Error).message}`)
    }
  }

  async testPerformanceWithLargeDataset(): Promise<void> {
    try {
      const testUser = this.testUsers[0]
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `perf-tx-${i}`,
        description: `Performance Test Transaction ${i}`,
        amount: Math.random() * 1000,
        userId: testUser.id,
      }))

      const startTime = performance.now()
      migrationService.saveUserData(UNIFIED_STORAGE_KEYS.transactions, testUser.id, largeDataset)
      const saveTime = performance.now() - startTime

      const readStartTime = performance.now()
      const retrievedData = migrationService.getUserData(UNIFIED_STORAGE_KEYS.transactions, testUser.id)
      const readTime = performance.now() - readStartTime

      const performanceAcceptable = saveTime < 1000 && readTime < 500 // 1s save, 500ms read

      this.addResult(
        "Performance Test",
        performanceAcceptable && retrievedData.length === 1000,
        `Save: ${saveTime.toFixed(2)}ms, Read: ${readTime.toFixed(2)}ms, Records: ${retrievedData.length}`,
        { saveTime, readTime, recordCount: retrievedData.length },
      )
    } catch (error) {
      this.addResult("Performance Test", false, `Error: ${(error as Error).message}`)
    }
  }

  async runAllTests(): Promise<TestResult[]> {
    console.log("[Test] Starting Multi-User Isolation Test Suite...")

    await this.testMigrationDetection()
    await this.testMigrationExecution()
    await this.testUserDataIsolation()
    await this.testCrossUserAccessPrevention()
    await this.testDataIntegrity()
    await this.testUnifiedStorageStructure()
    await this.testSaveUserData()
    await this.testPerformanceWithLargeDataset()

    const passedTests = this.results.filter((r) => r.passed).length
    const totalTests = this.results.length

    console.log(`\n[Test] Test Suite Complete: ${passedTests}/${totalTests} tests passed`)

    if (passedTests === totalTests) {
      console.log("[Test] ✅ All tests passed! Multi-user isolation is working correctly.")
    } else {
      console.log("[Test] ❌ Some tests failed. Review the results above.")
    }

    return this.results
  }

  getResults(): TestResult[] {
    return this.results
  }

  getSummary(): { passed: number; failed: number; total: number; success: boolean } {
    const passed = this.results.filter((r) => r.passed).length
    const failed = this.results.filter((r) => !r.passed).length
    const total = this.results.length

    return {
      passed,
      failed,
      total,
      success: passed === total,
    }
  }
}

// Export for use in other contexts
export { MultiUserIsolationTester }

// Run tests if this script is executed directly
if (typeof window !== "undefined") {
  const tester = new MultiUserIsolationTester()
  tester.runAllTests().then((results) => {
    const summary = tester.getSummary()
    console.log("\n=== FINAL TEST SUMMARY ===")
    console.log(`Total Tests: ${summary.total}`)
    console.log(`Passed: ${summary.passed}`)
    console.log(`Failed: ${summary.failed}`)
    console.log(`Success Rate: ${((summary.passed / summary.total) * 100).toFixed(1)}%`)
    console.log(`Overall Result: ${summary.success ? "✅ SUCCESS" : "❌ FAILURE"}`)

    // Log detailed results for failed tests
    const failedTests = results.filter((r) => !r.passed)
    if (failedTests.length > 0) {
      console.log("\n=== FAILED TESTS DETAILS ===")
      failedTests.forEach((test) => {
        console.log(`❌ ${test.testName}: ${test.message}`)
        if (test.details) {
          console.log("   Details:", test.details)
        }
      })
    }
  })
}
