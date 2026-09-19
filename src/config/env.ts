import 'dotenv/config'

const requiredEnvVariables = [
  'JWT_SECRET_ACCESS_TOKEN',
  'JWT_SECRET_REFRESH_TOKEN',
  'JWT_SECRET_VERIFY_EMAIL_TOKEN',
  'ACCESS_TOKEN_EXPIRES_IN',
  'REFRESH_TOKEN_EXPIRES_IN',
  'EMAIL_VERIFY_TOKEN_EXPIRES_IN',
  'MONGO_URI',
  'DB_NAME',
  'USERS_COLLECTION',
  'REFRESH_TOKENS_COLLECTION',
  'FOLLOWS_COLLECTION',
  'EXPIRE_AFTER_SECONDS',
  'JWT_SECRET_FORGOT_PASSWORD_TOKEN',
  'FORGOT_PASSWORD_TOKEN_EXPIRES_IN',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
  'VIDEO_STATUS_COLLECTION',
  'TWEETS_COLLECTION',
  'HASHTAGS_COLLECTION',
  'BOOKMARKS_COLLECTION',
  'LIKES_COLLECTION',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'CONVERSATIONS_COLLECTION',
  'MESSAGES_COLLECTION'
] as const

for (const envName of requiredEnvVariables) {
  if (!process.env[envName]) {
    throw new Error(
      `Environment variable ${envName} is required but not defined.`
    )
  }
}

const expireAfterSeconds = Number(process.env.EXPIRE_AFTER_SECONDS)
if (Number.isNaN(expireAfterSeconds)) {
  throw new Error('Environment variable EXPIRE_AFTER_SECONDS must be a number.')
}

const smtpPort = Number(process.env.SMTP_PORT)
if (!Number.isInteger(smtpPort) || smtpPort <= 0) {
  throw new Error('Environment variable SMTP_PORT must be a positive integer.')
}

const port = Number(process.env.PORT || '3000')
if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error('Environment variable PORT must be an integer between 1 and 65535.')
}

const clientUrl = process.env.CLIENT_URL?.trim() || undefined
const corsOrigins = Array.from(
  new Set(
    [
      ...(process.env.CORS_ORIGINS ?? '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
      ...(clientUrl ? [clientUrl] : [])
    ]
  )
)

export const envConfig = {
  JWT_SECRET_ACCESS_TOKEN: process.env.JWT_SECRET_ACCESS_TOKEN as string,
  JWT_SECRET_REFRESH_TOKEN: process.env.JWT_SECRET_REFRESH_TOKEN as string,
  JWT_SECRET_VERIFY_EMAIL_TOKEN: process.env
    .JWT_SECRET_VERIFY_EMAIL_TOKEN as string,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
  EMAIL_VERIFY_TOKEN_EXPIRES_IN: process.env
    .EMAIL_VERIFY_TOKEN_EXPIRES_IN as string,
  MONGO_URI: process.env.MONGO_URI as string,
  DB_NAME: process.env.DB_NAME as string,
  USERS_COLLECTION: process.env.USERS_COLLECTION as string,
  REFRESH_TOKENS_COLLECTION: process.env.REFRESH_TOKENS_COLLECTION as string,
  FOLLOWS_COLLECTION: process.env.FOLLOWS_COLLECTION as string,
  EXPIRE_AFTER_SECONDS: expireAfterSeconds,
  PORT: String(port),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  JWT_SECRET_FORGOT_PASSWORD_TOKEN: process.env
    .JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
  FORGOT_PASSWORD_TOKEN_EXPIRES_IN: process.env
    .FORGOT_PASSWORD_TOKEN_EXPIRES_IN as string,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
  CLIENT_URL: clientUrl,
  CORS_ORIGINS: corsOrigins,
  VIDEO_STATUS_COLLECTION: process.env.VIDEO_STATUS_COLLECTION as string,
  TWEETS_COLLECTION: process.env.TWEETS_COLLECTION as string,
  HASHTAGS_COLLECTION: process.env.HASHTAGS_COLLECTION as string,
  BOOKMARKS_COLLECTION: process.env.BOOKMARKS_COLLECTION as string,
  LIKES_COLLECTION: process.env.LIKES_COLLECTION as string,
  BASE_URL:
    process.env.BASE_URL || `http://localhost:${process.env.PORT || '3000'}`,
  SMTP_HOST: process.env.SMTP_HOST as string,
  SMTP_PORT: smtpPort,
  SMTP_USER: process.env.SMTP_USER as string,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD as string,
  SUPABASE_URL: process.env.SUPABASE_URL as string,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  CONVERSATIONS_COLLECTION: process.env.CONVERSATIONS_COLLECTION as string,
  MESSAGES_COLLECTION: process.env.MESSAGES_COLLECTION as string
}
