import type { SyncJobEntity, SyncJobProps } from "../../domain/sync-job-entity"

export interface SyncJobRepositoryPort {
  create(entity: SyncJobEntity): Promise<SyncJobProps>
  findById(id: string): Promise<SyncJobProps | null>
  /**
   * Atomically claims up to `limit` PENDING jobs whose scheduledAt <= now,
   * marks them as RUNNING and returns them. Backed by SELECT ... FOR UPDATE SKIP LOCKED.
   */
  claimPending(limit: number): Promise<SyncJobProps[]>
  update(id: string, patch: Partial<SyncJobProps>): Promise<SyncJobProps>
}

export const SYNC_JOB_REPOSITORY = Symbol("SYNC_JOB_REPOSITORY")
