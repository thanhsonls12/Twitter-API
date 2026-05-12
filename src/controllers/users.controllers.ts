import {
  FollowRequestBody,
  ForgotPasswordRequestBody,
  LoginRequestBody,
  RefreshTokensRequestBody,
  RegisterRequestBody,
  ResetPasswordRequestBody,
  UpdateMeRequestBody,
  VerifyEmailTokenRequestBody,
  VerifyForgotPasswordTokenRequestBody
} from '@/models/requests/User.requests.js'
import usersService from '@/services/users.services.js'
import { AUTH_MESSAGES, USERS_MESSAGES } from '@/constants/messages.js'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ErrorWithStatus } from '@/models/Errors.js'
import httpStatus from '@/constants/httpStatus.js'

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterRequestBody>,
  res: Response
) => {
  const result = await usersService.register(req.body)

  return res.status(201).json({
    message: AUTH_MESSAGES.USER_REGISTERED_SUCCESSFULLY,
    data: result
  })
}

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginRequestBody>,
  res: Response
) => {
  const user = req.user
  if (!user || !user._id) {
    throw new ErrorWithStatus({
      message: AUTH_MESSAGES.INVALID_EMAIL_OR_PASSWORD,
      status: httpStatus.UNAUTHORIZED
    })
  }
  const user_id = user._id.toString()
  const { access_token, refresh_token } = await usersService.login({
    user_id,
    verify: user.verify
  })
  return res.json({
    message: AUTH_MESSAGES.LOGIN_SUCCESS,
    data: {
      user_id,
      access_token,
      refresh_token
    }
  })
}

export const logoutController = async (
  req: Request<ParamsDictionary, any, RefreshTokensRequestBody>,
  res: Response
) => {
  const { refresh_token } = req.body
  const user_id = req.decoded_authorization?.user_id
  const result = await usersService.logout(refresh_token, user_id as string)
  return res.json(result)
}

export const refreshTokensController = async (
  req: Request<ParamsDictionary, any, RefreshTokensRequestBody>,
  res: Response
) => {
  const { refresh_token } = req.body
  const user_id = req.decoded_refresh_token?.user_id
  const result = await usersService.refreshTokens({
    user_id: user_id as string,
    refresh_token
  })
  return res.json({
    message: AUTH_MESSAGES.TOKENS_REFRESHED_SUCCESSFULLY,
    data: result
  })
}

export const verifyEmailTokenController = async (
  req: Request<ParamsDictionary, any, VerifyEmailTokenRequestBody>,
  res: Response
) => {
  const { email_verify_token, refresh_token: old_refresh_token } = req.body
  const user_id = req.decoded_email_verify_token?.user_id
  const refresh_token_user_id = req.decoded_refresh_token?.user_id
  if (!user_id) {
    throw new ErrorWithStatus({
      message: AUTH_MESSAGES.EMAIL_VERIFY_TOKEN_IS_INVALID,
      status: httpStatus.UNAUTHORIZED
    })
  }
  const result = await usersService.verifyEmailToken(
    user_id,
    email_verify_token,
    old_refresh_token,
    refresh_token_user_id as string
  )
  return res.json(result)
}

export const resendVerifyEmailController = async (
  req: Request,
  res: Response
) => {
  const user_id = req.decoded_authorization?.user_id
  if (!user_id) {
    throw new ErrorWithStatus({
      message: AUTH_MESSAGES.ACCESS_TOKEN_IS_INVALID,
      status: httpStatus.UNAUTHORIZED
    })
  }
  const result = await usersService.resendVerifyEmail(user_id)
  return res.json(result)
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordRequestBody>,
  res: Response
) => {
  const { email } = req.body
  const result = await usersService.forgotPassword(email)
  return res.json(result)
}

export const verifyForgotPasswordTokenController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordTokenRequestBody>,
  res: Response
) => {
  const { forgot_password_token } = req.body
  const user_id = req.decoded_forgot_password_token?.user_id
  if (!user_id) {
    throw new ErrorWithStatus({
      message: AUTH_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID,
      status: httpStatus.UNAUTHORIZED
    })
  }
  const result = await usersService.verifyForgotPasswordToken(
    user_id,
    forgot_password_token
  )
  return res.json(result)
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordRequestBody>,
  res: Response
) => {
  const { forgot_password_token, new_password } = req.body
  const user_id = req.decoded_forgot_password_token?.user_id
  if (!user_id) {
    throw new ErrorWithStatus({
      message: AUTH_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID,
      status: httpStatus.UNAUTHORIZED
    })
  }
  const result = await usersService.resetPassword(
    user_id,
    forgot_password_token,
    new_password
  )
  return res.json(result)
}

export const getMeController = async (req: Request, res: Response) => {
  const user_id = req.decoded_authorization?.user_id
  if (!user_id) {
    throw new ErrorWithStatus({
      message: AUTH_MESSAGES.ACCESS_TOKEN_IS_INVALID,
      status: httpStatus.UNAUTHORIZED
    })
  }
  const result = await usersService.getMe(user_id)
  return res.json({
    message: USERS_MESSAGES.USER_FETCHED_SUCCESSFULLY,
    data: result
  })
}

export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeRequestBody>,
  res: Response
) => {
  const user_id = req.decoded_authorization?.user_id
  if (!user_id) {
    throw new ErrorWithStatus({
      message: AUTH_MESSAGES.ACCESS_TOKEN_IS_INVALID,
      status: httpStatus.UNAUTHORIZED
    })
  }
  const updateData = req.body
  const result = await usersService.updateMe(user_id, updateData)
  return res.json({
    message: USERS_MESSAGES.USER_UPDATED_SUCCESSFULLY,
    data: result
  })
}

export const getUserProfileController = async (req: Request, res: Response) => {
  const username = req.params.username as string
  const result = await usersService.getUserProfile(username)
  return res.json({
    message: USERS_MESSAGES.USER_PROFILE_FETCHED_SUCCESSFULLY,
    data: result
  })
}

export const followController = async (
  req: Request<ParamsDictionary, any, FollowRequestBody>,
  res: Response
) => {
  const user_id = req.decoded_authorization?.user_id
  if (!user_id) {
    throw new ErrorWithStatus({
      message: AUTH_MESSAGES.ACCESS_TOKEN_IS_INVALID,
      status: httpStatus.UNAUTHORIZED
    })
  }
  const { user_id: target_user_id } = req.body
  const result = await usersService.follow(user_id, target_user_id)
  return res.json(result)
}
