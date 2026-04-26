import { Injectable, Inject } from "@nestjs/common"
import {
  RECURRING_TEMPLATE_REPOSITORY,
  type IRecurringTemplateRepository,
} from "../ports/recurring-template-repository.port"
import type { RecurringTemplateRecord } from "../../domain/recurring-template.types"

@Injectable()
export class ToggleRecurringPauseUseCase {
  constructor(
    @Inject(RECURRING_TEMPLATE_REPOSITORY)
    private readonly repo: IRecurringTemplateRepository,
  ) {}

  async execute(
    userId: string,
    templateId: string,
    paused: boolean,
  ): Promise<RecurringTemplateRecord> {
    const updated = await this.repo.update(templateId, userId, {
      paused,
      pausedAt: paused ? new Date() : null,
    })
    if (!updated) {
      throw Object.assign(new Error("Série de recorrência não encontrada"), {
        status: 404,
        code: "RECURRING_TEMPLATE_NOT_FOUND",
      })
    }
    return updated
  }
}
