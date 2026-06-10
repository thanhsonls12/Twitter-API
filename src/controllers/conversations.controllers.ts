import { TokenPayload } from '@/@types/express.js'
import httpStatus from '@/constants/httpStatus.js'
import { CONVERSATIONS_MESSAGES } from '@/constants/messages.js'
import { CreateConversationRequest } from '@/models/requests/Conversation.requests.js'
import conversationService from '@/services/conversations.services.js'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
export const createConversationController = async (
  req: Request<ParamsDictionary, any, CreateConversationRequest>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const { receiver_id } = req.body

  const result = await conversationService.createConversation(
    user_id,
    receiver_id
  )

  return res
    .status(httpStatus.CREATED)
    .json({ message: CONVERSATIONS_MESSAGES.CONVERSATION_CREATED, result })
}

export const getConversationsController = async (
  req: Request,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await conversationService.getConversations(user_id)

  return res
    .status(httpStatus.OK)
    .json({ message: CONVERSATIONS_MESSAGES.CONVERSATIONS_FETCHED, result })
}

export const getMessagesController = async (req: Request, res: Response) => {
  const { conversation_id } = req.params
  const limit = Number(req.query.limit) || 20
  const cursor = req.query.cursor as string | undefined
  const result = await conversationService.getMessages(
    conversation_id as string,
    limit,
    cursor
  )
  return res.status(httpStatus.OK).json({
    message: CONVERSATIONS_MESSAGES.MESSAGES_FETCHED,
    result
  })
}
