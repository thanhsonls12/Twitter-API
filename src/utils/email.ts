import { envConfig } from '@/config/env.js'
import nodemailer from 'nodemailer'
const transporter = nodemailer.createTransport({
  host: envConfig.SMTP_HOST,
  port: envConfig.SMTP_PORT,
  secure: false,
  auth: {
    user: envConfig.SMTP_USER,
    pass: envConfig.SMTP_PASSWORD
  }
})

export async function sendVerifyEmail(to: string, token: string) {
  const verifyLink = envConfig.CLIENT_URL
    ? `${envConfig.CLIENT_URL}/verify-email?token=${token}`
    : null

  await transporter.sendMail({
    from: `"Twitter Clone" <${envConfig.SMTP_USER}>`,
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

  await transporter.sendMail({
    from: `"Twitter Clone" <${envConfig.SMTP_USER}>`,
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
