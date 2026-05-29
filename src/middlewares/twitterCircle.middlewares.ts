import { TWITTER_CIRCLE_MESSAGES } from '@/constants/messages.js'
import { validate } from '@/utils/validation.js'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

export const addToCircleValidator = validate(
  checkSchema(
    {
      user_id: {
        notEmpty: {
          errorMessage: TWITTER_CIRCLE_MESSAGES.USER_ID_REQUIRED
        },
        custom: {
          options: (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new Error(TWITTER_CIRCLE_MESSAGES.USER_ID_INVALID)
            }
            const { user_id: current_user_id } = req.decoded_authorization as {
              user_id: string
            }
            if (value === current_user_id) {
              throw new Error(
                TWITTER_CIRCLE_MESSAGES.CANNOT_ADD_YOURSELF_TO_CIRCLE
              )
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const removeFromCircleValidator = validate(
  checkSchema(
    {
      user_id: {
        notEmpty: {
          errorMessage: TWITTER_CIRCLE_MESSAGES.USER_ID_REQUIRED
        },
        custom: {
          options: (value) => {
            if (!ObjectId.isValid(value)) {
              throw new Error(TWITTER_CIRCLE_MESSAGES.USER_ID_INVALID)
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)
