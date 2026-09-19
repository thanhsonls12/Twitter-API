import {
  getTrendingHashtagsController,
  getSuggestedUsersController
} from '@/controllers/discover.controllers.js'
import { wrapRequestHandler } from '@/utils/handler.js'
import express from 'express'

const discoverRouter = express.Router()

discoverRouter.get(
  '/hashtags/trending',
  wrapRequestHandler(getTrendingHashtagsController)
)

discoverRouter.get(
  '/users/suggested',
  wrapRequestHandler(getSuggestedUsersController)
)

export default discoverRouter
