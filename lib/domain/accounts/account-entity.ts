export interface AccountEntityProps {
  id: string
  userId: string
  balance: number
  allowsNegativeBalance?: boolean
}

export class AccountEntity {
  constructor(private readonly props: AccountEntityProps) {}

  get value(): AccountEntityProps {
    return this.props
  }

  canDebit(amount: number): boolean {
    if (this.props.allowsNegativeBalance) {
      return true
    }

    return this.props.balance >= amount
  }
}
