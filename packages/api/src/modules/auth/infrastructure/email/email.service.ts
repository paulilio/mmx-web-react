import { Injectable, Logger } from "@nestjs/common"
import nodemailer, { type Transporter } from "nodemailer"
import { authConfig } from "@/config/auth.config"
import type {
  IEmailService,
  SendVerificationEmailInput,
  SendPasswordResetEmailInput,
} from "../../application/ports/email-service.port"
import { renderVerifyEmail } from "./templates/verify-email.template"
import { renderResetPasswordEmail } from "./templates/reset-password.template"

@Injectable()
export class SmtpEmailService implements IEmailService {
  private readonly logger = new Logger(SmtpEmailService.name)
  private transporter: Transporter | null = null

  private getTransporter(): Transporter {
    if (this.transporter) return this.transporter
    const { smtpHost, smtpPort, smtpUser, smtpPass } = authConfig.email
    if (!smtpHost || !smtpUser || !smtpPass) {
      throw Object.assign(new Error("SMTP não configurado"), { status: 503, code: "SMTP_NOT_CONFIGURED" })
    }
    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    })
    return this.transporter
  }

  private fromHeader(): string {
    const { fromAddress, fromName } = authConfig.email
    return fromName ? `"${fromName}" <${fromAddress}>` : fromAddress
  }

  async sendVerificationEmail(input: SendVerificationEmailInput): Promise<void> {
    const { subject, html, text } = renderVerifyEmail({
      recipientName: input.recipientName,
      verifyUrl: input.verifyUrl,
    })
    await this.send(input.to, subject, html, text)
  }

  async sendPasswordResetEmail(input: SendPasswordResetEmailInput): Promise<void> {
    const { subject, html, text } = renderResetPasswordEmail({
      recipientName: input.recipientName,
      resetUrl: input.resetUrl,
    })
    await this.send(input.to, subject, html, text)
  }

  private async send(to: string, subject: string, html: string, text: string): Promise<void> {
    try {
      const info = await this.getTransporter().sendMail({
        from: this.fromHeader(),
        to,
        subject,
        html,
        text,
      })
      this.logger.log(`Email enviado: messageId=${info.messageId} to=${to} subject="${subject}"`)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao enviar email"
      this.logger.error(`Falha ao enviar email para ${to}: ${message}`)
      throw Object.assign(new Error(message), { status: 502, code: "EMAIL_SEND_FAILED" })
    }
  }
}
