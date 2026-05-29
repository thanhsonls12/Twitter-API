import {
  addToCircleController,
  removeFromCircleController
} from '@/controllers/twitterCircle.controllers.js'
import {
  addToCircleValidator,
  removeFromCircleValidator
} from '@/middlewares/twitterCircle.middlewares.js'
import {
  accessTokenValidator,
  verifiedUserValidator
} from '@/middlewares/users.middlewares.js'
import { wrapRequestHandler } from '@/utils/handler.js'
import express from 'express'

const twitterCircleRouter = express.Router()

twitterCircleRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  addToCircleValidator,
  wrapRequestHandler(addToCircleController)
)

twitterCircleRouter.delete(
  '/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  removeFromCircleValidator,
  wrapRequestHandler(removeFromCircleController)
)

export default twitterCircleRouter
