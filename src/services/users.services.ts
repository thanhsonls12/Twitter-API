import User from '@/models/schemas/User.schema.js'
import databaseService from './database.services.js'
import { RegisterRequestBody } from '@/models/requests/User.requests.js'
import { hashPassword } from '@/utils/crypto.js'
import { signToken } from '@/utils/jwt.js'
import { TokenType, UserVerifyStatus } from '@/constants/enums.js'
import { envConfig } from '@/config/env.js'
import { SignOptions } from 'jsonwebtoken'
import RefreshToken from '@/models/schemas/RefreshToken.schema.js'
import { ObjectId } from 'mongodb'
import { AUTH_MESSAGES } from '@/constants/messages.js'
import { ErrorWithStatus } from '@/models/Errors.js'
import httpStatus from '@/constants/httpStatus.js'

class UsersService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken
      },
      secretKey: envConfig.JWT_SECRET_ACCESS_TOKEN,
      options: {
        expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn']
      }
    })
  }
  private signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken
      },
      secretKey: envConfig.JWT_SECRET_REFRESH_TOKEN,
      options: {
        expiresIn:
          envConfig.REFRESH_TOKEN_EXPIRES_IN as SignOptions['expiresIn']
      }
    })
  }

  private signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken
      },
      secretKey: envConfig.JWT_SECRET_VERIFY_EMAIL_TOKEN,
      options: {
        expiresIn:
          envConfig.EMAIL_VERIFY_TOKEN_EXPIRES_IN as SignOptions['expiresIn']
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
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken(
      user_id.toString()
    )
    const result = await databaseService.users.insertOne(
      new User({
        _id: user_id,
        ...payload,
        email_verify_token,
        date_of_birth: new Date(payload.day_of_birth),
        password: await hashPassword(payload.password)
      })
    )

    const [access_token, refresh_token] = await this.signAccessAndRefreshTokens(
      user_id.toString()
    )
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    console.log('email_verify_token:', email_verify_token)
    return {
      ...result,
      user_id,
      access_token,
      refresh_token
    }
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
  async logout(refresh_token: string, user_id: string) {
    await databaseService.refreshTokens.deleteOne({
      token: refresh_token,
      user_id: new ObjectId(user_id)
    })
    return { message: AUTH_MESSAGES.LOGOUT_SUCCESSFUL }
  }
  async refreshTokens(user_id: string, refresh_token: string) {
    const [new_access_token, new_refresh_token] =
      await this.signAccessAndRefreshTokens(user_id)
    await databaseService.refreshTokens.findOneAndUpdate(
      {
        token: refresh_token,
        user_id: new ObjectId(user_id)
      },
      {
        $set: { token: new_refresh_token }
      }
    )
    return { access_token: new_access_token, refresh_token: new_refresh_token }
  }
  async verifyEmailToken(user_id: string, email_verify_token: string) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id)
    })
    if (!user) {
      throw new ErrorWithStatus({
        message: AUTH_MESSAGES.EMAIL_VERIFY_TOKEN_IS_INVALID,
        status: httpStatus.UNAUTHORIZED
      })
    }
    if (user.verify === UserVerifyStatus.Verified) {
      return {
        message: AUTH_MESSAGES.EMAIL_ALREADY_VERIFIED
      }
    }
    if (user.email_verify_token !== email_verify_token) {
      throw new ErrorWithStatus({
        message: AUTH_MESSAGES.EMAIL_VERIFY_TOKEN_IS_INVALID,
        status: httpStatus.UNAUTHORIZED
      })
    }
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id),
        email_verify_token
      },
      {
        $set: {
          email_verify_token: '',
          verify: UserVerifyStatus.Verified
        },
        $currentDate: { updated_at: true }
      }
    )
    return { message: AUTH_MESSAGES.EMAIL_VERIFIED_SUCCESSFULLY }
  }
  async resendVerifyEmail(user_id: string) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id)
    })
    if (!user) {
      throw new ErrorWithStatus({
        message: AUTH_MESSAGES.EMAIL_VERIFY_TOKEN_IS_INVALID,
        status: httpStatus.UNAUTHORIZED
      })
    }
    if (user.verify === UserVerifyStatus.Verified) {
      return {
        message: AUTH_MESSAGES.EMAIL_ALREADY_VERIFIED
      }
    }
    const email_verify_token = await this.signEmailVerifyToken(user_id)
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          email_verify_token
        },
        $currentDate: { updated_at: true }
      }
    )
    console.log('resend email_verify_token', email_verify_token)
    return {
      message: AUTH_MESSAGES.EMAIL_VERIFY_TOKEN_RESENT_SUCCESSFULLY
    }
  }
}

const usersService = new UsersService()
export default usersService
