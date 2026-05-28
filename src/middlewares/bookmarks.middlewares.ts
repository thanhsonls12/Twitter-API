import { BOOKMARKS_MESSAGES } from '@/constants/messages.js'
import databaseService from '@/services/database.services.js'
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
          options: async (value) => {
            if (!ObjectId.isValid(value)) {
              throw new Error(BOOKMARKS_MESSAGES.TWEET_ID_INVALID)
            }
            const tweet = await databaseService.tweets.findOne({
              _id: new ObjectId(value)
            })
            if (!tweet) {
              throw new Error(BOOKMARKS_MESSAGES.TWEET_NOT_FOUND)
            }
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
      tweetId: {
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
