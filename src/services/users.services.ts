import User from '@/models/schemas/User.schema.js'
import databaseService from './database.services.js'
import {
  RegisterRequestBody,
  UpdateMeRequestBody
} from '@/models/requests/User.requests.js'
import { hashPassword } from '@/utils/crypto.js'
import { signToken } from '@/utils/jwt.js'
import { TokenType, UserVerifyStatus } from '@/constants/enums.js'
import { envConfig } from '@/config/env.js'
import { SignOptions } from 'jsonwebtoken'
import RefreshToken from '@/models/schemas/RefreshToken.schema.js'
import { ObjectId } from 'mongodb'
import { AUTH_MESSAGES, USERS_MESSAGES } from '@/constants/messages.js'
import { ErrorWithStatus } from '@/models/Errors.js'
import httpStatus from '@/constants/httpStatus.js'

class UsersService {
  private signAccessToken({
    user_id,
    verify
  }: {
    user_id: string
    verify: UserVerifyStatus
  }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify
      },
      secretKey: envConfig.JWT_SECRET_ACCESS_TOKEN,
      options: {
        expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN as SignOptions['expiresIn']
      }
    })
  }
  private signRefreshToken({
    user_id,
    verify
  }: {
    user_id: string
    verify: UserVerifyStatus
  }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify
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

  private signForgotPasswordToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken
      },
      secretKey: envConfig.JWT_SECRET_FORGOT_PASSWORD_TOKEN,
      options: {
        expiresIn:
          envConfig.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as SignOptions['expiresIn']
      }
    })
  }

  private signAccessAndRefreshTokens({
    user_id,
    verify
  }: {
    user_id: string
    verify: UserVerifyStatus
  }) {
    return Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify })
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
        date_of_birth: new Date(payload.date_of_birth),
        password: await hashPassword(payload.password)
      })
    )

    const [access_token, refresh_token] = await this.signAccessAndRefreshTokens(
      { user_id: user_id.toString(), verify: UserVerifyStatus.Unverified }
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
  async login({
    user_id,
    verify
  }: {
    user_id: string
    verify: UserVerifyStatus
  }) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id)
    })
    if (!user) {
      throw new ErrorWithStatus({
        message: AUTH_MESSAGES.INVALID_EMAIL_OR_PASSWORD,
        status: httpStatus.UNAUTHORIZED
      })
    }
    const [access_token, refresh_token] = await this.signAccessAndRefreshTokens(
      { user_id, verify }
    )
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
  async refreshTokens({
    user_id,
    refresh_token
  }: {
    user_id: string
    refresh_token: string
  }) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id)
    })
    if (!user) {
      throw new ErrorWithStatus({
        message: AUTH_MESSAGES.REFRESH_TOKEN_IS_INVALID,
        status: httpStatus.UNAUTHORIZED
      })
    }
    const [new_access_token, new_refresh_token] =
      await this.signAccessAndRefreshTokens({ user_id, verify: user.verify })
    const updatedRefreshToken =
      await databaseService.refreshTokens.findOneAndUpdate(
        {
          token: refresh_token,
          user_id: new ObjectId(user_id)
        },
        {
          $set: { token: new_refresh_token }
        }
      )
    if (!updatedRefreshToken) {
      throw new ErrorWithStatus({
        message: AUTH_MESSAGES.REFRESH_TOKEN_IS_INVALID,
        status: httpStatus.UNAUTHORIZED
      })
    }
    return { access_token: new_access_token, refresh_token: new_refresh_token }
  }
  async verifyEmailToken(
    user_id: string,
    email_verify_token: string,
    old_refresh_token: string,
    refresh_token_user_id: string
  ) {
    if (user_id !== refresh_token_user_id) {
      throw new ErrorWithStatus({
        message: AUTH_MESSAGES.REFRESH_TOKEN_IS_INVALID,
        status: httpStatus.UNAUTHORIZED
      })
    }
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
    const [access_token, refresh_token] = await this.signAccessAndRefreshTokens(
      {
        user_id,
        verify: UserVerifyStatus.Verified
      }
    )
    const updatedRefreshToken =
      await databaseService.refreshTokens.findOneAndUpdate(
        {
          user_id: new ObjectId(user_id),
          token: old_refresh_token
        },
        {
          $set: { token: refresh_token }
        }
      )
    if (!updatedRefreshToken) {
      throw new ErrorWithStatus({
        message: AUTH_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXISTS,
        status: httpStatus.UNAUTHORIZED
      })
    }
    return {
      message: AUTH_MESSAGES.EMAIL_VERIFIED_SUCCESSFULLY,
      access_token,
      refresh_token
    }
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

  async forgotPassword(email: string) {
    const user = await databaseService.users.findOne({ email })
    if (!user) {
      return {
        message: AUTH_MESSAGES.FORGOT_PASSWORD_EMAIL_SENT
      }
    }
    const forgot_password_token = await this.signForgotPasswordToken(
      user._id.toString()
    )
    await databaseService.users.updateOne(
      {
        _id: user._id
      },
      {
        $set: {
          forgot_password_token
        },
        $currentDate: { updated_at: true }
      }
    )
    console.log('forgot_password_token', forgot_password_token)
    return {
      message: AUTH_MESSAGES.FORGOT_PASSWORD_EMAIL_SENT
    }
  }

  async verifyForgotPasswordToken(
    user_id: string,
    forgot_password_token: string
  ) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id)
    })
    if (!user || user.forgot_password_token !== forgot_password_token) {
      throw new ErrorWithStatus({
        message: AUTH_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID,
        status: httpStatus.UNAUTHORIZED
      })
    }

    return { message: AUTH_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_VALID }
  }

  async resetPassword(
    user_id: string,
    forgot_password_token: string,
    new_password: string
  ) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id)
    })
    if (!user || user.forgot_password_token !== forgot_password_token) {
      throw new ErrorWithStatus({
        message: AUTH_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID,
        status: httpStatus.UNAUTHORIZED
      })
    }
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id),
        forgot_password_token
      },
      {
        $set: {
          password: await hashPassword(new_password),
          forgot_password_token: ''
        },
        $currentDate: { updated_at: true }
      }
    )
    return { message: AUTH_MESSAGES.RESET_PASSWORD_SUCCESSFULLY }
  }

  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: httpStatus.NOT_FOUND
      })
    }
    return user
  }
  async updateMe(user_id: string, payload: UpdateMeRequestBody = {}) {
    const { date_of_birth, ...rest } = payload
    const updatePayload = {
      ...rest,
      ...(date_of_birth && { date_of_birth: new Date(date_of_birth) })
    }
    const user = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: updatePayload,
        $currentDate: { updated_at: true }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: httpStatus.NOT_FOUND
      })
    }
    return user
  }
}

const usersService = new UsersService()
export default usersService
