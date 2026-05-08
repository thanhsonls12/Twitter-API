import {
  loginController,
  logoutController,
  refreshTokensController,
  registerController
} from '@/controllers/users.controllers.js'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '@/middlewares/users.middlewares.js'
import { wrapRequestHandler } from '@/utils/handler.js'

import express from 'express'

import { authLimiter } from '@/middlewares/rateLimit.middlewares.js'

const usersRouter = express.Router()

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

export default usersRouter
