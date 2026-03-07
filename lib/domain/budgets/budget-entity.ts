export interface BudgetEntityProps {
  id: string
  userId: string
  limitAmount: number
  spentAmount: number
}

export class BudgetEntity {
  constructor(private readonly props: BudgetEntityProps) {}

  get value(): BudgetEntityProps {
    return this.props
  }

  get remainingAmount(): number {
    return this.props.limitAmount - this.props.spentAmount
  }

  canSpend(amount: number): boolean {
    return amount <= this.remainingAmount
  }
}
