import databaseService from '@/services/database.services.js'
import { validate } from '@/utils/validation.js'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

export const likeTweetValidator = validate(
  checkSchema(
    {
      tweet_id: {
        notEmpty: {
          errorMessage: 'Tweet ID is required'
        },
        custom: {
          options: async (value) => {
            if (!ObjectId.isValid(value)) {
              throw new Error('Invalid Tweet ID')
            }
            const tweet = await databaseService.tweets.findOne({
              _id: new ObjectId(value)
            })
            if (!tweet) {
              throw new Error('Tweet not found')
            }
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
          errorMessage: 'Tweet ID is required'
        },
        custom: {
          options: async (value) => {
            if (!ObjectId.isValid(value)) {
              throw new Error('Invalid Tweet ID')
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)
