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
  DAY_OF_BIRTH_IS_REQUIRED: 'Day of birth is required'
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
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required'
} as const
