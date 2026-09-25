const testEnv: Record<string, string> = {
  JWT_SECRET_ACCESS_TOKEN: 'test-access-secret',
  JWT_SECRET_REFRESH_TOKEN: 'test-refresh-secret',
  JWT_SECRET_VERIFY_EMAIL_TOKEN: 'test-email-secret',
  ACCESS_TOKEN_EXPIRES_IN: '15m',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
  EMAIL_VERIFY_TOKEN_EXPIRES_IN: '1d',
  MONGO_URI: 'mongodb://127.0.0.1:27017',
  DB_NAME: 'twitter_test',
  USERS_COLLECTION: 'users',
  REFRESH_TOKENS_COLLECTION: 'refresh_tokens',
  FOLLOWS_COLLECTION: 'follows',
  EXPIRE_AFTER_SECONDS: '604800',
  JWT_SECRET_FORGOT_PASSWORD_TOKEN: 'test-forgot-secret',
  FORGOT_PASSWORD_TOKEN_EXPIRES_IN: '15m',
  GOOGLE_CLIENT_ID: 'test-google-client-id',
  GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
  GOOGLE_CALLBACK_URL: 'http://localhost/oauth/google/callback',
  CLIENT_URL: 'http://localhost:3001',
  VIDEO_STATUS_COLLECTION: 'video_status',
  TWEETS_COLLECTION: 'tweets',
  HASHTAGS_COLLECTION: 'hashtags',
  BOOKMARKS_COLLECTION: 'bookmarks',
  LIKES_COLLECTION: 'likes',
  RESEND_API_KEY: 're_test',
  EMAIL_FROM: 'Twitter API <twitter@example.com>',
  SUPABASE_URL: 'http://localhost:54321',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  CONVERSATIONS_COLLECTION: 'conversations',
  MESSAGES_COLLECTION: 'messages',
  NODE_ENV: 'test'
}

for (const [name, value] of Object.entries(testEnv)) {
  process.env[name] ??= value
}
