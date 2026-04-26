import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common"
import { SyncJobEntity } from "../../domain/sync-job-entity"
import {
  SYNC_JOB_REPOSITORY,
  type SyncJobRepositoryPort,
} from "../ports/sync-job-repository.port"
import { SyncTransactionsUseCase } from "../use-cases/sync-transactions.use-case"

const DEFAULT_TICK_MS = 30_000
const DEFAULT_BATCH = 5

@Injectable()
export class SyncJobRunner implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SyncJobRunner.name)
  private timer: NodeJS.Timeout | null = null
  private running = false
  private stopped = false

  constructor(
    @Inject(SYNC_JOB_REPOSITORY)
    private readonly jobs: SyncJobRepositoryPort,
    private readonly syncUseCase: SyncTransactionsUseCase,
  ) {}

  onModuleInit(): void {
    if (process.env.MMX_OPEN_FINANCE_RUNNER_ENABLED === "false") {
      this.logger.log("SyncJobRunner desabilitado via env")
      return
    }
    const tickMs = parsePositiveInt(process.env.MMX_OPEN_FINANCE_TICK_MS, DEFAULT_TICK_MS)
    this.scheduleNext(tickMs)
    this.logger.log(`SyncJobRunner iniciado com tick=${tickMs}ms`)
  }

  onModuleDestroy(): void {
    this.stopped = true
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  private scheduleNext(tickMs: number): void {
    if (this.stopped) return
    this.timer = setTimeout(() => {
      void this.tick().finally(() => this.scheduleNext(tickMs))
    }, tickMs)
    if (typeof this.timer.unref === "function") this.timer.unref()
  }

  async tick(): Promise<{ processed: number }> {
    if (this.running) return { processed: 0 }
    this.running = true
    try {
      const batchSize = parsePositiveInt(process.env.MMX_OPEN_FINANCE_BATCH, DEFAULT_BATCH)
      const claimed = await this.jobs.claimPending(batchSize)
      if (claimed.length === 0) return { processed: 0 }
      this.logger.log(`Processando ${claimed.length} jobs`)
      for (const job of claimed) {
        await this.processOne(job.id as string, job.bankConnectionId)
      }
      return { processed: claimed.length }
    } catch (err) {
      this.logger.error("tick falhou", err)
      return { processed: 0 }
    } finally {
      this.running = false
    }
  }

  private async processOne(jobId: string, bankConnectionId: string): Promise<void> {
    try {
      await this.syncUseCase.execute({ bankConnectionId })
      const job = await this.jobs.findById(jobId)
      if (!job) return
      const entity = SyncJobEntity.fromRecord(job)
      await this.jobs.update(jobId, entity.complete())
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      this.logger.warn(`Job ${jobId} falhou: ${message}`)
      const job = await this.jobs.findById(jobId)
      if (!job) return
      const entity = SyncJobEntity.fromRecord(job)
      await this.jobs.update(jobId, entity.retryOrFail(message))
    }
  }
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}
