import {
  normalizeAreaStatus,
  normalizeAreaType,
  validateAreaColor,
  validateAreaIcon,
  validateAreaName,
} from "./area-rules"

export type DomainAreaType =
  | "INCOME"
  | "EXPENSE"
  | "FIXED_EXPENSES"
  | "DAILY_EXPENSES"
  | "PERSONAL"
  | "TAXES_FEES"

export type DomainAreaStatus = "ACTIVE" | "INACTIVE"

export interface AreaEntityProps {
  userId: string
  name: string
  description?: string | null
  type: DomainAreaType
  color: string
  icon: string
  status: DomainAreaStatus
}

export interface CreateAreaEntityInput {
  userId: string
  name: string
  description?: string | null
  type: string
  color: string
  icon: string
  status?: string
}

export interface UpdateAreaEntityInput {
  name?: string
  description?: string | null
  type?: string
  color?: string
  icon?: string
  status?: string
}

export interface AreaEntityUpdatePayload {
  name?: string
  description?: string | null
  type?: DomainAreaType
  color?: string
  icon?: string
  status?: DomainAreaStatus
}

export class AreaEntity {
  constructor(private readonly props: AreaEntityProps) {}

  static create(input: CreateAreaEntityInput): AreaEntity {
    validateAreaName(input.name)
    validateAreaColor(input.color)
    validateAreaIcon(input.icon)

    return new AreaEntity({
      userId: input.userId,
      name: input.name.trim(),
      description: input.description,
      type: normalizeAreaType(input.type),
      color: input.color.trim(),
      icon: input.icon.trim(),
      status: input.status ? normalizeAreaStatus(input.status) : "ACTIVE",
    })
  }

  static fromRecord(record: AreaEntityProps): AreaEntity {
    return new AreaEntity(record)
  }

  get value(): AreaEntityProps {
    return this.props
  }

  buildUpdatePayload(input: UpdateAreaEntityInput): AreaEntityUpdatePayload {
    if (typeof input.name === "string") {
      validateAreaName(input.name)
    }

    if (typeof input.color === "string") {
      validateAreaColor(input.color)
    }

    if (typeof input.icon === "string") {
      validateAreaIcon(input.icon)
    }

    return {
      name: input.name?.trim(),
      description: input.description,
      type: input.type ? normalizeAreaType(input.type) : undefined,
      color: input.color?.trim(),
      icon: input.icon?.trim(),
      status: input.status ? normalizeAreaStatus(input.status) : undefined,
    }
  }
}
