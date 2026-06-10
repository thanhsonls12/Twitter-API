import {
  createConversationController,
  getConversationsController,
  getMessagesController
} from '@/controllers/conversations.controllers.js'
import {
  createConversationValidator,
  getMessagesValidator
} from '@/middlewares/conversations.middlewares.js'
import {
  accessTokenValidator,
  verifiedUserValidator
} from '@/middlewares/users.middlewares.js'
import { wrapRequestHandler } from '@/utils/handler.js'
import express from 'express'

const conversationsRouter = express.Router()

conversationsRouter.get(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(getConversationsController)
)

conversationsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createConversationValidator,
  wrapRequestHandler(createConversationController)
)

conversationsRouter.get(
  '/:conversation_id/messages',
  accessTokenValidator,
  verifiedUserValidator,
  getMessagesValidator,
  wrapRequestHandler(getMessagesController)
)

export default conversationsRouter
