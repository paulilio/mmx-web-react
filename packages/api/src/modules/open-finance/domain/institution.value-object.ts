export interface InstitutionProps {
  code: string
  name: string
}

export class Institution {
  constructor(private readonly props: InstitutionProps) {
    if (!props.code?.trim()) {
      throw new Error("Codigo da instituicao e obrigatorio")
    }
    if (!props.name?.trim()) {
      throw new Error("Nome da instituicao e obrigatorio")
    }
  }

  get code(): string {
    return this.props.code
  }

  get name(): string {
    return this.props.name
  }

  get value(): InstitutionProps {
    return this.props
  }
}
