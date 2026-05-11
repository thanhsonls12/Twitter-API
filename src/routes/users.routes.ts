import {
  forgotPasswordController,
  getMeController,
  loginController,
  logoutController,
  refreshTokensController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  updateMeController,
  verifyEmailTokenController,
  verifyForgotPasswordTokenController
} from '@/controllers/users.controllers.js'
import {
  accessTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyEmailTokenValidator,
  verifyForgotPasswordTokenValidator
} from '@/middlewares/users.middlewares.js'
import { wrapRequestHandler } from '@/utils/handler.js'

import express from 'express'

import { authLimiter } from '@/middlewares/rateLimit.middlewares.js'

const usersRouter = express.Router()

/* -----POST-----*/

usersRouter.post(
  '/register',
  authLimiter,
  registerValidator,
  wrapRequestHandler(registerController)
)

usersRouter.post(
  '/login',
  authLimiter,
  loginValidator,
  wrapRequestHandler(loginController)
)

usersRouter.post(
  '/logout',
  accessTokenValidator,
  refreshTokenValidator,
  wrapRequestHandler(logoutController)
)

usersRouter.post(
  '/refresh-token',
  refreshTokenValidator,
  wrapRequestHandler(refreshTokensController)
)

usersRouter.post(
  '/verify-email',
  verifyEmailTokenValidator,
  refreshTokenValidator,
  wrapRequestHandler(verifyEmailTokenController)
)

usersRouter.post(
  '/resend-verify-email',
  accessTokenValidator,
  wrapRequestHandler(resendVerifyEmailController)
)

usersRouter.post(
  '/forgot-password',
  authLimiter,
  forgotPasswordValidator,
  wrapRequestHandler(forgotPasswordController)
)

usersRouter.post(
  '/verify-forgot-password-token',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordTokenController)
)

usersRouter.post(
  '/reset-password',
  resetPasswordValidator,
  wrapRequestHandler(resetPasswordController)
)

/* -----GET-----*/
usersRouter.get(
  '/me',
  accessTokenValidator,
  wrapRequestHandler(getMeController)
)

/* -----PATCH-----*/
usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  wrapRequestHandler(updateMeController)
)

export default usersRouter
