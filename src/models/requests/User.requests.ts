export interface RegisterRequestBody {
  name: string
  email: string
  password: string
  confirm_password: string
  day_of_birth: string
}

export interface LoginRequestBody {
  email: string
  password: string
}

export interface RefreshTokensRequestBody {
  refresh_token: string
}

export interface VerifyEmailTokenRequestBody {
  email_verify_token: string
}

export interface ForgotPasswordRequestBody {
  email: string
}

export interface VerifyForgotPasswordTokenRequestBody {
  forgot_password_token: string
}

export interface ResetPasswordRequestBody {
  forgot_password_token: string
  new_password: string
  confirm_new_password: string
}
