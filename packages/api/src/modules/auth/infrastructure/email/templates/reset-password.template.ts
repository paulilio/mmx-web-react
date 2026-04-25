export function renderResetPasswordEmail(params: { recipientName: string; resetUrl: string }): { subject: string; html: string; text: string } {
  const { recipientName, resetUrl } = params
  const subject = "Redefina sua senha no MoedaMix"
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#f6f8fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1f2937">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8fa;padding:40px 0">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">
        <tr><td style="padding:32px 32px 8px 32px">
          <h1 style="margin:0 0 8px 0;font-size:22px;color:#111827">Olá, ${escapeHtml(recipientName)}</h1>
          <p style="margin:0 0 16px 0;font-size:15px;line-height:1.55;color:#374151">
            Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo para escolher uma nova senha.
          </p>
        </td></tr>
        <tr><td align="center" style="padding:8px 32px 24px 32px">
          <a href="${resetUrl}" style="display:inline-block;background:#0ea5e9;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 28px;border-radius:8px;font-size:15px">
            Redefinir senha
          </a>
        </td></tr>
        <tr><td style="padding:0 32px 24px 32px">
          <p style="margin:0;font-size:13px;line-height:1.55;color:#6b7280">
            Se o botão não funcionar, copie e cole este link no navegador:<br>
            <a href="${resetUrl}" style="color:#0ea5e9;word-break:break-all">${resetUrl}</a>
          </p>
          <p style="margin:16px 0 0 0;font-size:12px;color:#9ca3af">
            Este link expira em 1 hora. Se você não pediu para redefinir a senha, ignore este email — sua senha atual continua válida.
          </p>
        </td></tr>
      </table>
      <p style="margin:16px 0 0 0;font-size:12px;color:#9ca3af">© MoedaMix</p>
    </td></tr>
  </table>
</body>
</html>`
  const text = [
    `Olá, ${recipientName}`,
    "",
    "Recebemos um pedido para redefinir a senha da sua conta. Para escolher uma nova senha, acesse:",
    resetUrl,
    "",
    "Este link expira em 1 hora. Se você não pediu, ignore este email.",
  ].join("\n")
  return { subject, html, text }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
