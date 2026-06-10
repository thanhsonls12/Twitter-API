import { TokenPayload } from '@/@types/express.js'
import httpStatus from '@/constants/httpStatus.js'
import { CONVERSATIONS_MESSAGES } from '@/constants/messages.js'
import { ErrorWithStatus } from '@/models/Errors.js'
import databaseService from '@/services/database.services.js'
import { validate } from '@/utils/validation.js'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

export const createConversationValidator = validate(
  checkSchema(
    {
      receiver_id: {
        notEmpty: {
          errorMessage: CONVERSATIONS_MESSAGES.RECEIVER_ID_REQUIRED
        },
        isMongoId: {
          errorMessage: CONVERSATIONS_MESSAGES.RECEIVER_ID_INVALID
        },
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = req.decoded_authorization as TokenPayload
            if (value === user_id) {
              throw new ErrorWithStatus({
                message:
                  CONVERSATIONS_MESSAGES.CANNOT_CREATE_CONVERSATION_WITH_YOURSELF,
                status: httpStatus.BAD_REQUEST
              })
            }
            const receiver = await databaseService.users.findOne({
              _id: new ObjectId(value)
            })
            if (!receiver) {
              throw new ErrorWithStatus({
                message: CONVERSATIONS_MESSAGES.RECEIVER_NOT_FOUND,
                status: httpStatus.NOT_FOUND
              })
            }
          }
        }
      }
    },
    ['body']
  )
)

export const getMessagesValidator = validate(
  checkSchema(
    {
      conversation_id: {
        isMongoId: {
          errorMessage: CONVERSATIONS_MESSAGES.CONVERSATION_ID_INVALID
        },
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = req.decoded_authorization as TokenPayload
            const conversation = await databaseService.conversations.findOne({
              _id: new ObjectId(value),
              participants: new ObjectId(user_id)
            })
            if (!conversation) {
              throw new ErrorWithStatus({
                message: CONVERSATIONS_MESSAGES.CONVERSATION_NOT_FOUND,
                status: httpStatus.NOT_FOUND
              })
            }
          }
        }
      }
    },
    ['params']
  )
)
