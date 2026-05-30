import {
  createTweetController,
  deleteTweetController,
  getTweetChildrenController,
  getTweetController
} from '@/controllers/tweets.controllers.js'
import {
  audienceValidator,
  createTweetValidator,
  deleteTweetValidator,
  getTweetChildrenValidator,
  getTweetValidator
} from '@/middlewares/tweets.middlewares.js'
import {
  accessTokenValidator,
  isUserLoggedInValidator,
  verifiedUserValidator
} from '@/middlewares/users.middlewares.js'
import { wrapRequestHandler } from '@/utils/handler.js'
import experss from 'express'

const tweetsRouter = experss.Router()

tweetsRouter.get(
  '/:tweet_id',
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  getTweetValidator,
  audienceValidator,
  wrapRequestHandler(getTweetController)
)

tweetsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
)

tweetsRouter.delete(
  '/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  deleteTweetValidator,
  wrapRequestHandler(deleteTweetController)
)

tweetsRouter.get(
  '/:tweet_id/children',
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  getTweetChildrenValidator,
  wrapRequestHandler(getTweetChildrenController)
)

export default tweetsRouter
