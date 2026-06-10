export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation Error',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  NAME_IS_REQUIRED: 'Name is required',
  EMAIL_IS_REQUIRED: 'Email is required',
  INVALID_EMAIL_FORMAT: 'Invalid email format',
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_STRING: 'Password must be a string',
  PASSWORD_LENGTH: 'Password must be between 6 and 50 characters',
  PASSWORD_STRENGTH:
    'Password must be at least 6 characters long and include uppercase, lowercase, number, and symbol',
  NAME_MUST_BE_STRING: 'Name must be a string',
  NAME_LENGTH: 'Name must be between 1 and 50 characters',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_STRING: 'Confirm password must be a string',
  CONFIRM_PASSWORD_LENGTH:
    'Confirm password must be between 6 and 50 characters',
  CONFIRM_PASSWORD_MISMATCH: 'Confirm password does not match password',
  DATE_OF_BIRTH_IS_REQUIRED: 'Date of birth is required',
  USER_FETCHED_SUCCESSFULLY: 'User fetched successfully',
  USER_NOT_FOUND: 'User not found',
  USER_NOT_VERIFIED: 'User is not verified',
  USER_UPDATED_SUCCESSFULLY: 'User updated successfully',
  DATE_OF_BIRTH_MUST_BE_IN_PAST: 'Date of birth must be in the past',
  INVALID_DATE_OF_BIRTH_FORMAT:
    'Invalid date of birth format, expected YYYY-MM-DD',
  NO_FIELDS_TO_UPDATE: 'No fields to update',
  BODY_MUST_BE_JSON_OBJECT: 'Request body must be a JSON object',
  BIO_MUST_BE_STRING: 'Bio must be a string',
  BIO_LENGTH: 'Bio must be at most 160 characters long',
  LOCATION_MUST_BE_STRING: 'Location must be a string',
  LOCATION_LENGTH: 'Location must be at most 160 characters long',
  WEBSITE_MUST_BE_VALID_URL: 'Website must be a valid URL',
  USERNAME_MUST_BE_STRING: 'Username must be a string',
  USERNAME_LENGTH: 'Username must be between 2 and 50 characters long',
  USERNAME_INVALID_CHARACTERS:
    'Username can only contain letters, numbers, and underscores',
  USERNAME_ALREADY_EXISTS: 'Username already exists',
  AVATAR_MUST_BE_VALID_URL: 'Avatar must be a valid URL',
  COVER_PHOTO_MUST_BE_VALID_URL: 'Cover photo must be a valid URL',
  USERNAME_IS_REQUIRED: 'Username is required',
  USER_PROFILE_FETCHED_SUCCESSFULLY: 'User profile fetched successfully',
  USERID_IS_REQUIRED: 'User ID is required',
  USERID_MUST_BE_STRING: 'User ID must be a string',
  USERID_LENGTH: 'User ID must be between 2 and 50 characters long',
  CANNOT_FOLLOW_YOURSELF: 'You cannot follow yourself',
  USERID_INVALID: 'User ID is invalid',
  ALREADY_FOLLOWED: 'You already followed this user',
  USER_NOT_FOLLOWED: 'You have not followed this user',
  PASSWORD_CHANGED_SUCCESSFULLY: 'Password changed successfully'
} as const

export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',

  USER_REGISTERED_SUCCESSFULLY: 'User registered successfully',
  INVALID_EMAIL_OR_PASSWORD: 'Invalid email or password',
  LOGOUT_SUCCESSFUL: 'Logout successful',
  JWT_TOKEN_GENERATION_FAILED: 'JWT token generation failed',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  REFRESH_TOKEN_IS_INVALID: 'Refresh token is invalid',
  USED_REFRESH_TOKEN_OR_NOT_EXISTS:
    'Used refresh token or refresh token does not exist',
  ACCESS_TOKEN_IS_INVALID: 'Access token is invalid',
  TOKENS_REFRESHED_SUCCESSFULLY: 'Tokens refreshed successfully',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  EMAIL_VERIFY_TOKEN_IS_INVALID: 'Email verify token is invalid',
  EMAIL_ALREADY_VERIFIED: 'Email is already verified',
  EMAIL_VERIFIED_SUCCESSFULLY: 'Email verified successfully',
  EMAIL_VERIFY_TOKEN_RESENT_SUCCESSFULLY:
    'Email verify token resent successfully',
  FORGOT_PASSWORD_EMAIL_SENT:
    'If a user with the provided email exists, a forgot password email has been sent',
  FORGOT_PASSWORD_TOKEN_IS_INVALID: 'Forgot password token is invalid',
  FORGOT_PASSWORD_TOKEN_IS_VALID: 'Forgot password token is valid',
  RESET_PASSWORD_SUCCESSFULLY: 'Password reset successfully',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  CURRENT_PASSWORD_IS_INCORRECT: 'Current password is incorrect',
  GOOGLE_OAUTH_FAILED: 'Google OAuth failed'
} as const

export const MEDIAS_MESSAGES = {
  ONLY_IMAGE_FILES_ARE_ALLOWED: 'Only image files are allowed',
  NO_IMAGE_FILE_UPLOADED: 'No image file uploaded',
  ONLY_VIDEO_FILES_ARE_ALLOWED: 'Only video files are allowed',
  NO_VIDEO_FILE_UPLOADED: 'No video file uploaded',
  INVALID_VIDEO_FILE_TYPE: 'Invalid video file type',
  VIDEO_UPLOADED_AND_QUEUED_FOR_HLS_CONVERSION:
    'Video uploaded and queued for HLS conversion',
  VIDEO_STATUS_NOT_FOUND: 'Video status not found'
} as const

export const TWEETS_MESSAGES = {
  TYPE_REQUIRED: 'Type is required',
  AUDIENCE_REQUIRED: 'Audience is required',
  INVALID_TYPE: 'Invalid type',
  INVALID_AUDIENCE: 'Invalid audience',
  PARENT_ID_MUST_BE_A_VALID_TWEET_ID: 'Parent ID must be a valid tweet ID',
  PARENT_ID_MUST_BE_NULL: 'Parent ID must be null for type Tweet',
  CONTENT_MUST_BE_STRING: 'Content must be a string',
  CONTENT_MUST_BE_LESS_THAN_280_CHARACTERS:
    'Content must be less than 280 characters',
  CONTENT_OR_MEDIA_REQUIRED: 'Content or media is required',
  CONTENT_MUST_BE_EMPTY_STRING:
    'Content must be an empty string for type Retweet',
  HASHTAGS_MUST_BE_ARRAY: 'Hashtags must be an array',
  HASHTAGS_MUST_BE_ARRAY_OF_STRINGS: 'Hashtags must be an array of strings',
  MENTIONS_MUST_BE_ARRAY: 'Mentions must be an array',
  MENTIONS_MUST_BE_ARRAY_OF_STRINGS: 'Mentions must be an array of strings',
  MEDIAS_MUST_BE_ARRAY: 'Medias must be an array',
  MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECTS:
    'Medias must be an array of media objects',
  PARENT_ID_NOT_EMPTY:
    'Parent ID must not be empty for type Comment, QuoteTweet, or Retweet',
  TWEET_ID_REQUIRED: 'Tweet ID is required',
  TWEET_ID_INVALID: 'Tweet ID is invalid',
  TWEET_NOT_FOUND: 'Tweet not found',
  TWEET_FETCHED: 'Tweet fetched successfully',
  TWEET_CREATED: 'Tweet created successfully',
  TWEET_DELETED: 'Tweet deleted successfully',
  TWEET_CHILDREN_FETCHED: 'Tweet children fetched successfully',
  IS_NOT_PUBLIC: 'The tweet is not public',
  PAGE_MUST_BE_INTEGER_AND_GREATER_THAN_0:
    'Page must be an integer greater than 0',
  LIMIT_MUST_BE_INTEGER_AND_BETWEEN_1_AND_100:
    'Limit must be an integer between 1 and 100',
  NEW_FEEDS_FETCHED: 'New feeds fetched successfully'
} as const

export const LIKES_MESSAGES = {
  LIKE_CREATED: 'Like created successfully',
  LIKE_DELETED: 'Unlike successfully',
  LIKE_NOT_FOUND: 'Like not found',
  LIKES_FETCHED: 'Likes fetched successfully',
  TWEET_ID_REQUIRED: 'Tweet ID is required',
  TWEET_ID_INVALID: 'Tweet ID is invalid',
  TWEET_NOT_FOUND: 'Tweet not found'
} as const

export const BOOKMARKS_MESSAGES = {
  BOOKMARK_CREATED: 'Bookmark created successfully',
  BOOKMARK_DELETED: 'Bookmark deleted successfully',
  BOOKMARK_NOT_FOUND: 'Bookmark not found',
  BOOKMARKS_FETCHED: 'Bookmarks fetched successfully',
  TWEET_ID_REQUIRED: 'Tweet ID is required',
  TWEET_ID_INVALID: 'Tweet ID is invalid',
  TWEET_NOT_FOUND: 'Tweet not found'
} as const

export const TWITTER_CIRCLE_MESSAGES = {
  USER_ID_REQUIRED: 'User ID is required',
  USER_ID_INVALID: 'User ID is invalid',
  CANNOT_ADD_YOURSELF_TO_CIRCLE:
    'You cannot add yourself to your Twitter Circle',
  USER_ADDED_TO_CIRCLE: 'User added to Twitter Circle',
  USER_REMOVED_FROM_CIRCLE: 'User removed from Twitter Circle',
  CIRCLE_LIMIT_REACHED: 'Twitter Circle can have a maximum of 150 members',
  USER_NOT_FOUND: 'User not found'
} as const

export const SEARCH_MESSAGES = {
  SEARCH_QUERY_REQUIRED: 'Search query is required',
  SEARCH_QUERY_MUST_BE_STRING: 'Search query must be a string',
  SEARCH_QUERY_LENGTH: 'Search query must be between 1 and 100 characters',
  PAGE_MUST_BE_INTEGER_AND_GREATER_THAN_0:
    'Page must be an integer greater than 0',
  LIMIT_MUST_BE_INTEGER_AND_BETWEEN_1_AND_100:
    'Limit must be an integer between 1 and 100',
  USERS_FETCHED_SUCCESSFULLY: 'Users fetched successfully',
  TWEETS_FETCHED_SUCCESSFULLY: 'Tweets fetched successfully',
  MEDIA_TYPE_INVALID: 'Media type is invalid',
  PEOPLE_FOLLOW_INVALID: 'People follow must be either 0 or 1'
} as const

export const CONVERSATIONS_MESSAGES = {
  RECEIVER_ID_REQUIRED: 'Receiver ID is required',
  RECEIVER_ID_INVALID: 'Receiver ID is invalid',
  CANNOT_CREATE_CONVERSATION_WITH_YOURSELF:
    'You cannot create a conversation with yourself',
  RECEIVER_NOT_FOUND: 'Receiver not found',
  CONVERSATION_ID_INVALID: 'Conversation ID is invalid',
  CONVERSATION_NOT_FOUND: 'Conversation not found',
  CONTENT_REQUIRED: 'Message content is required',
  CONVERSATIONS_FETCHED: 'Conversations fetched successfully',
  CONVERSATION_CREATED: 'Conversation created successfully',
  MESSAGES_FETCHED: 'Messages fetched successfully'
} as const

export const SOCKET_MESSAGES = {
  TOKEN_REQUIRED: 'Authentication error: Token is required',
  TOKEN_INVALID: 'Authentication error: Invalid token',
  INVALID_PAYLOAD: 'Invalid socket payload',
  SEND_MESSAGE_FAILED: 'Failed to send message',
  TYPING_FAILED: 'Failed to send typing status',
  USER_CONNECTED: 'User connected',
  USER_DISCONNECTED: 'User disconnected',
  MESSAGE_RECEIVED: 'Message received',
  USER_TYPING: 'User is typing'
} as const
