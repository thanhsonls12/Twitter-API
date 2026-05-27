import { createTweetController } from '@/controllers/tweets.controllers.js'
import { createTweetValidator } from '@/middlewares/tweets.middlewares.js'
import {
  accessTokenValidator,
  verifiedUserValidator
} from '@/middlewares/users.middlewares.js'
import { wrapRequestHandler } from '@/utils/handler.js'
import experss from 'express'

const tweetsRouter = experss.Router()

tweetsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
)

export default tweetsRouter
