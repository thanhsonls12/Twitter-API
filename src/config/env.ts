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
  'CLIENT_URL',
  'VIDEO_STATUS_COLLECTION'
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
  PORT: process.env.PORT || '3000',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  JWT_SECRET_FORGOT_PASSWORD_TOKEN: process.env
    .JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
  FORGOT_PASSWORD_TOKEN_EXPIRES_IN: process.env
    .FORGOT_PASSWORD_TOKEN_EXPIRES_IN as string,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
  CLIENT_URL: process.env.CLIENT_URL as string,
  VIDEO_STATUS_COLLECTION: process.env.VIDEO_STATUS_COLLECTION as string,
  BASE_URL:
    process.env.BASE_URL || `http://localhost:${process.env.PORT || '3000'}`
}
