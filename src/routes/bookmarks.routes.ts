import {
  bookmarkTweetController,
  unbookmarkTweetController
} from '@/controllers/bookmarks.controllers.js'
import {
  bookmarkTweetValidator,
  unbookmarkTweetValidator
} from '@/middlewares/bookmarks.middlewares.js'
import {
  accessTokenValidator,
  verifiedUserValidator
} from '@/middlewares/users.middlewares.js'
import { wrapRequestHandler } from '@/utils/handler.js'
import express from 'express'

const bookmarksRouter = express.Router()

bookmarksRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  bookmarkTweetValidator,
  wrapRequestHandler(bookmarkTweetController)
)

bookmarksRouter.delete(
  '/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  unbookmarkTweetValidator,
  wrapRequestHandler(unbookmarkTweetController)
)

export default bookmarksRouter
