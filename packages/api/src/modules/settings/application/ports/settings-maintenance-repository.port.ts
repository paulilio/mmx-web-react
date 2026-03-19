import type {
  SeedData,
  ImportResult,
  ClearResult,
} from "../../domain/settings.types"

export const SETTINGS_MAINTENANCE_REPOSITORY = Symbol("ISettingsMaintenanceRepository")

export interface ISettingsMaintenanceRepository {
  exportData(userId: string, tables?: unknown[]): Promise<Partial<SeedData>>
  importData(userId: string, seedData: unknown): Promise<ImportResult>
  clearData(userId: string, tables?: unknown[]): Promise<ClearResult>
}
