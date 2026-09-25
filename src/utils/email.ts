import { envConfig } from '@/config/env.js'
import { Resend } from 'resend'

const resend = new Resend(envConfig.RESEND_API_KEY)

async function sendEmail({
  to,
  subject,
  html
}: {
  to: string
  subject: string
  html: string
}) {
  const { error } = await resend.emails.send({
    from: envConfig.EMAIL_FROM,
    to,
    subject,
    html
  })

  if (error) {
    throw new Error(`Resend email delivery failed: ${error.message}`)
  }
}

export async function sendVerifyEmail(to: string, token: string) {
  const verifyLink = envConfig.CLIENT_URL
    ? `${envConfig.CLIENT_URL}/verify-email?token=${token}`
    : null

  await sendEmail({
    to,
    subject: 'Verify your email for Twitter Clone',
    html: `
      <h2>Verify your email address</h2>
      ${
        verifyLink
          ? `<p>Click the link below to verify your email:</p><a href="${verifyLink}">${verifyLink}</a>`
          : `<p>Use this verification token with <code>POST /users/verify-email</code>:</p><code>${token}</code>`
      }
      <p>This link expires in 15 minutes.</p>
    `
  })
}

export async function sendForgotPasswordEmail(to: string, token: string) {
  const resetLink = envConfig.CLIENT_URL
    ? `${envConfig.CLIENT_URL}/reset-password?token=${token}`
    : null

  await sendEmail({
    to,
    subject: 'Reset your password for Twitter Clone',
    html: `
      <h2>Reset your password</h2>
      ${
        resetLink
          ? `<p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
          : `<p>Use this reset token with <code>POST /users/reset-password</code>:</p><code>${token}</code>`
      }
      <p>This link expires in 15 minutes.</p>
    `
  })
}
