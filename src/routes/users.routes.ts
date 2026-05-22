import {
  changePasswordController,
  followController,
  forgotPasswordController,
  getMeController,
  getUserProfileController,
  loginController,
  logoutController,
  oauthGoogleController,
  refreshTokensController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  unFollowController,
  updateMeController,
  verifyEmailTokenController,
  verifyForgotPasswordTokenController
} from '@/controllers/users.controllers.js'
import {
  accessTokenValidator,
  changePasswordValidator,
  followValidator,
  forgotPasswordValidator,
  getUserProfileValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeBodyValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyEmailTokenValidator,
  verifyForgotPasswordTokenValidator
} from '@/middlewares/users.middlewares.js'
import { wrapRequestHandler } from '@/utils/handler.js'

import express from 'express'

import { authLimiter } from '@/middlewares/rateLimit.middlewares.js'
import passport from '@/config/passport.js'
import { envConfig } from '@/config/env.js'

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

usersRouter.post(
  '/:user_id/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandler(followController)
)

/* -----GET-----*/
usersRouter.get(
  '/me',
  accessTokenValidator,
  wrapRequestHandler(getMeController)
)

usersRouter.get(
  '/oauth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
)

usersRouter.get(
  '/oauth/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${envConfig.CLIENT_URL}/login`
  }),
  wrapRequestHandler(oauthGoogleController)
)

usersRouter.get(
  '/:username',
  getUserProfileValidator,
  wrapRequestHandler(getUserProfileController)
)

/* -----PATCH-----*/
usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeBodyValidator,
  updateMeValidator,
  wrapRequestHandler(updateMeController)
)

/* -----PUT-----*/
usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)

/* -----DELETE-----*/
usersRouter.delete(
  '/:user_id/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandler(unFollowController)
)

export default usersRouter
