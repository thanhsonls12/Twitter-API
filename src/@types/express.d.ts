import User from '@/models/schemas/User.schema.js'
import { TokenType, UserVerifyStatus } from '@/constants/enums.js'
import { JwtPayload } from 'jsonwebtoken'
import { WithId } from 'mongodb'

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  verify?: UserVerifyStatus
}

declare global {
  namespace Express {
    interface Request {
      user?: WithId<User> & { access_token?: string; refresh_token?: string }
      decoded_authorization?: TokenPayload
      decoded_refresh_token?: TokenPayload
      decoded_email_verify_token?: TokenPayload
      decoded_forgot_password_token?: TokenPayload
    }
  }
}

export {}
