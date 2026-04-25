export const EMAIL_SERVICE = Symbol("IEmailService")

export interface SendVerificationEmailInput {
  to: string
  recipientName: string
  verifyUrl: string
}

export interface SendPasswordResetEmailInput {
  to: string
  recipientName: string
  resetUrl: string
}

export interface IEmailService {
  sendVerificationEmail(input: SendVerificationEmailInput): Promise<void>
  sendPasswordResetEmail(input: SendPasswordResetEmailInput): Promise<void>
}
