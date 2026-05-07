import {
  loginController,
  logoutController,
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

const usersRouter = express.Router()

usersRouter.post(
  '/register',
  registerValidator,
  wrapRequestHandler(registerController)
)

usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

usersRouter.post(
  '/logout',
  accessTokenValidator,
  refreshTokenValidator,
  wrapRequestHandler(logoutController)
)

export default usersRouter
