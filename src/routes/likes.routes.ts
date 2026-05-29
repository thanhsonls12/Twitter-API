import {
  likeTweetController,
  unlikeTweetController
} from '@/controllers/likes.controllers.js'
import {
  likeTweetValidator,
  unlikeTweetValidator
} from '@/middlewares/likes.middlewares.js'
import {
  accessTokenValidator,
  verifiedUserValidator
} from '@/middlewares/users.middlewares.js'
import { wrapRequestHandler } from '@/utils/handler.js'
import express from 'express'

const likesRouter = express.Router()

likesRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  likeTweetValidator,
  wrapRequestHandler(likeTweetController)
)

likesRouter.delete(
  '/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  unlikeTweetValidator,
  wrapRequestHandler(unlikeTweetController)
)

export default likesRouter
