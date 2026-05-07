import User from '@/models/schemas/User.schema.js'
import { TokenType } from '@/constants/enums.js'
import { JwtPayload } from 'jsonwebtoken'
import { WithId } from 'mongodb'

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
}

declare global {
  namespace Express {
    interface Request {
      user?: WithId<User>
      decoded_authorization?: TokenPayload
      decoded_refresh_token?: TokenPayload
    }
  }
}

export {}
