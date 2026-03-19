import {
  normalizeRolloverEnabled,
  validateMonth,
  validateNonNegativeAmount,
  validateYear,
} from "./budget-rules"

export interface BudgetEntityProps {
  userId: string
  categoryGroupId: string
  month: number
  year: number
  planned: number
  funded: number
  spent: number
  rolloverEnabled: boolean
  rolloverAmount?: number | null
}

export interface CreateBudgetInput {
  userId: string
  categoryGroupId: string
  month: number
  year: number
  planned: number
  funded: number
  rolloverEnabled?: boolean | null
  rolloverAmount?: number | null
}

export interface UpdateBudgetInput {
  planned?: number
  funded?: number
  rolloverEnabled?: boolean | null
  rolloverAmount?: number | null
}

export class BudgetEntity {
  constructor(private readonly props: BudgetEntityProps) {}

  static create(input: CreateBudgetInput): BudgetEntity {
    validateMonth(input.month)
    validateYear(input.year)
    validateNonNegativeAmount(input.planned, "planned")
    validateNonNegativeAmount(input.funded, "funded")

    return new BudgetEntity({
      userId: input.userId,
      categoryGroupId: input.categoryGroupId,
      month: input.month,
      year: input.year,
      planned: input.planned,
      funded: input.funded,
      spent: 0,
      rolloverEnabled: normalizeRolloverEnabled(input.rolloverEnabled),
      rolloverAmount: input.rolloverAmount ?? null,
    })
  }

  static fromRecord(record: BudgetEntityProps): BudgetEntity {
    return new BudgetEntity(record)
  }

  get value(): BudgetEntityProps {
    return this.props
  }

  buildUpdatePayload(input: UpdateBudgetInput): Partial<BudgetEntityProps> {
    if (typeof input.planned === "number") {
      validateNonNegativeAmount(input.planned, "planned")
    }
    if (typeof input.funded === "number") {
      validateNonNegativeAmount(input.funded, "funded")
    }

    return {
      planned: input.planned ?? undefined,
      funded: input.funded ?? undefined,
      rolloverEnabled:
        input.rolloverEnabled == null
          ? undefined
          : normalizeRolloverEnabled(input.rolloverEnabled),
      rolloverAmount: input.rolloverAmount ?? undefined,
    }
  }
}
