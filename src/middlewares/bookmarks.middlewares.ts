import { TokenPayload } from '@/@types/express.js'
import { BOOKMARKS_MESSAGES } from '@/constants/messages.js'

import { assertCanAccessTweet } from '@/utils/tweetAudience.js'
import { validate } from '@/utils/validation.js'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

export const bookmarkTweetValidator = validate(
  checkSchema(
    {
      tweet_id: {
        notEmpty: {
          errorMessage: BOOKMARKS_MESSAGES.TWEET_ID_REQUIRED
        },
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new Error(BOOKMARKS_MESSAGES.TWEET_ID_INVALID)
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

export const unbookmarkTweetValidator = validate(
  checkSchema(
    {
      tweet_id: {
        notEmpty: {
          errorMessage: BOOKMARKS_MESSAGES.TWEET_ID_REQUIRED
        },
        custom: {
          options: async (value) => {
            if (!ObjectId.isValid(value)) {
              throw new Error(BOOKMARKS_MESSAGES.TWEET_ID_INVALID)
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)
