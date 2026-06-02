import {
  searchTweetsController,
  searchUsersController
} from '@/controllers/search.controllers.js'
import { searchValidator } from '@/middlewares/search.middlewares.js'
import {
  accessTokenValidator,
  isUserLoggedInValidator,
  verifiedUserValidator
} from '@/middlewares/users.middlewares.js'
import { wrapRequestHandler } from '@/utils/handler.js'
import express from 'express'

const searchRouter = express.Router()

searchRouter.get(
  '/users',
  searchValidator,
  wrapRequestHandler(searchUsersController)
)

searchRouter.get(
  '/tweets',
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  searchValidator,
  wrapRequestHandler(searchTweetsController)
)

export default searchRouter
