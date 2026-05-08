import 'dotenv/config'

const requiredEnvVariables = [
  'JWT_SECRET',
  'ACCESS_TOKEN_EXPIRES_IN',
  'REFRESH_TOKEN_EXPIRES_IN',
  'MONGO_URI',
  'DB_NAME',
  'USERS_COLLECTION',
  'REFRESH_TOKENS_COLLECTION',
  'EXPIRE_AFTER_SECONDS'
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
  JWT_SECRET: process.env.JWT_SECRET as string,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
  MONGO_URI: process.env.MONGO_URI as string,
  DB_NAME: process.env.DB_NAME as string,
  USERS_COLLECTION: process.env.USERS_COLLECTION as string,
  REFRESH_TOKENS_COLLECTION: process.env.REFRESH_TOKENS_COLLECTION as string,
  EXPIRE_AFTER_SECONDS: expireAfterSeconds,
  PORT: process.env.PORT ?? '3000',
  NODE_ENV: process.env.NODE_ENV ?? 'development'
}
