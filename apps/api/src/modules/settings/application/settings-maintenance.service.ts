import { Injectable, Inject } from "@nestjs/common"
import {
  SETTINGS_MAINTENANCE_REPOSITORY,
  type ISettingsMaintenanceRepository,
} from "./ports/settings-maintenance-repository.port"
import type {
  SeedData,
  ImportResult,
  ClearResult,
} from "../domain/settings.types"

@Injectable()
export class SettingsMaintenanceApplicationService {
  constructor(
    @Inject(SETTINGS_MAINTENANCE_REPOSITORY)
    private readonly repository: ISettingsMaintenanceRepository,
  ) {}

  async exportData(userId: string, tables?: unknown[]): Promise<Partial<SeedData>> {
    return this.repository.exportData(userId, tables)
  }

  async importData(userId: string, data: unknown): Promise<ImportResult> {
    return this.repository.importData(userId, data)
  }

  async clearData(userId: string, tables?: unknown[]): Promise<ClearResult> {
    return this.repository.clearData(userId, tables)
  }
}
