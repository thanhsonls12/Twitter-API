import User from '@/models/schemas/User.schema.js'
import databaseService from './database.services.js'
import { RegisterRequestBody } from '@/models/requests/User.requests.js'
import { hashPassword } from '@/utils/crypto.js'
import { signToken } from '@/utils/jwt.js'
import { TokenType } from '@/constants/enums.js'
import 'dotenv/config'
import { SignOptions } from 'jsonwebtoken'
import RefreshToken from '@/models/schemas/RefreshToken.schema.js'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '@/constants/messages.js'
class UsersService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken
      },
      options: {
        expiresIn: process.env
          .ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn']
      }
    })
  }
  private signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken
      },
      options: {
        expiresIn: process.env
          .REFRESH_TOKEN_EXPIRES_IN as SignOptions['expiresIn']
      }
    })
  }

  private signAccessAndRefreshTokens(user_id: string) {
    return Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])
  }

  async register(payload: RegisterRequestBody) {
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.day_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const user_id = result.insertedId.toString()
    const [access_token, refresh_token] =
      await this.signAccessAndRefreshTokens(user_id)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    return { ...result, user_id, access_token, refresh_token }
  }
  async checkEmailExists(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }
  async login(user_id: string) {
    const [access_token, refresh_token] =
      await this.signAccessAndRefreshTokens(user_id)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    return { access_token, refresh_token }
  }
  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return { message: USERS_MESSAGES.LOGOUT_SUCCESSFUL }
  }
}

const usersService = new UsersService()
export default usersService
