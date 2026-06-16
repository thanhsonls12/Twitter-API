import { TokenPayload } from '@/@types/express.js'
import { LIKES_MESSAGES } from '@/constants/messages.js'

import { assertCanAccessTweet } from '@/utils/tweetAudience.js'
import { validate } from '@/utils/validation.js'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

export const likeTweetValidator = validate(
  checkSchema(
    {
      tweet_id: {
        notEmpty: {
          errorMessage: LIKES_MESSAGES.TWEET_ID_REQUIRED
        },
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new Error(LIKES_MESSAGES.TWEET_ID_INVALID)
            }
            const { user_id } = req.decoded_authorization as TokenPayload
            await assertCanAccessTweet(value, user_id)
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const unlikeTweetValidator = validate(
  checkSchema(
    {
      tweet_id: {
        notEmpty: {
          errorMessage: LIKES_MESSAGES.TWEET_ID_REQUIRED
        },
        custom: {
          options: async (value) => {
            if (!ObjectId.isValid(value)) {
              throw new Error(LIKES_MESSAGES.TWEET_ID_INVALID)
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)
