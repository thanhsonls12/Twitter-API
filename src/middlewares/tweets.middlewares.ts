import { MediaType, TweetAudience, TweetType } from '@/constants/enums.js'
import { AUTH_MESSAGES, TWEETS_MESSAGES } from '@/constants/messages.js'
import { Media } from '@/models/Other.js'
import { numberEnumToArray } from '@/utils/commons.js'
import { wrapRequestHandler } from '@/utils/handler.js'
import { validate } from '@/utils/validation.js'
import { checkSchema } from 'express-validator'
import isEmpty from 'lodash/isEmpty.js'
import { ObjectId } from 'mongodb'
import { NextFunction, Request, Response } from 'express'
import databaseService from '@/services/database.services.js'
import { ErrorWithStatus } from '@/models/Errors.js'
import httpStatus from '@/constants/httpStatus.js'
const tweetTypes = numberEnumToArray(TweetType)

const tweetAudiences = numberEnumToArray(TweetAudience)

const mediaTypes = numberEnumToArray(MediaType)

export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        notEmpty: {
          errorMessage: TWEETS_MESSAGES.TYPE_REQUIRED
        },
        isInt: true,
        isIn: {
          options: [tweetTypes],
          errorMessage: TWEETS_MESSAGES.INVALID_TYPE
        }
      },
      audience: {
        notEmpty: {
          errorMessage: TWEETS_MESSAGES.AUDIENCE_REQUIRED
        },
        isInt: true,
        isIn: {
          options: [tweetAudiences],
          errorMessage: TWEETS_MESSAGES.INVALID_AUDIENCE
        }
      },
      parent_id: {
        optional: { options: { nullable: true } },
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetType
            if (
              [
                TweetType.Comment,
                TweetType.QuoteTweet,
                TweetType.Retweet
              ].includes(type)
            ) {
              if (typeof value !== 'string' || !ObjectId.isValid(value)) {
                throw new Error(
                  TWEETS_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID
                )
              }
            }
            if (
              type === TweetType.Tweet &&
              value !== null &&
              value !== undefined
            ) {
              throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_NULL)
            }
            return true
          }
        }
      },
      content: {
        optional: { options: { nullable: true } },
        isString: {
          errorMessage: TWEETS_MESSAGES.CONTENT_MUST_BE_STRING
        },
        isLength: {
          options: { max: 280 },
          errorMessage: TWEETS_MESSAGES.CONTENT_MUST_BE_LESS_THAN_280_CHARACTERS
        },
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetType
            const hashtags = req.body.hashtags
            const mentions = req.body.mentions
            const medias = req.body.medias
            const content = typeof value === 'string' ? value.trim() : ''
            if (
              [
                TweetType.Comment,
                TweetType.QuoteTweet,
                TweetType.Tweet
              ].includes(type) &&
              isEmpty(hashtags) &&
              isEmpty(mentions) &&
              isEmpty(medias) &&
              content === ''
            ) {
              throw new Error(TWEETS_MESSAGES.CONTENT_OR_MEDIA_REQUIRED)
            }
            if (type === TweetType.Retweet && content !== '') {
              throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING)
            }
            return true
          }
        }
      },
      hashtags: {
        optional: true,
        isArray: {
          errorMessage: TWEETS_MESSAGES.HASHTAGS_MUST_BE_ARRAY
        },
        custom: {
          options: (value) => {
            if (!Array.isArray(value)) return true
            if (!value.every((hashtag: any) => typeof hashtag === 'string')) {
              throw new Error(TWEETS_MESSAGES.HASHTAGS_MUST_BE_ARRAY_OF_STRINGS)
            }
            return true
          }
        }
      },
      mentions: {
        optional: true,
        isArray: {
          errorMessage: TWEETS_MESSAGES.MENTIONS_MUST_BE_ARRAY
        },
        custom: {
          options: (value) => {
            if (!Array.isArray(value)) return true
            if (
              !value.every(
                (mention: any) =>
                  typeof mention === 'string' && ObjectId.isValid(mention)
              )
            ) {
              throw new Error(TWEETS_MESSAGES.MENTIONS_MUST_BE_ARRAY_OF_STRINGS)
            }
            return true
          }
        }
      },
      medias: {
        optional: true,
        isArray: {
          errorMessage: TWEETS_MESSAGES.MEDIAS_MUST_BE_ARRAY
        },
        custom: {
          options: (value) => {
            if (!Array.isArray(value)) return true
            if (
              value.some((media: Media) => {
                return (
                  typeof media !== 'object' ||
                  typeof media.url !== 'string' ||
                  !mediaTypes.includes(media.type)
                )
              })
            ) {
              throw new Error(
                TWEETS_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECTS
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

export const getTweetValidator = validate(
  checkSchema(
    {
      tweet_id: {
        notEmpty: {
          errorMessage: TWEETS_MESSAGES.TWEET_ID_REQUIRED
        },
        custom: {
          options: async (value) => {
            if (!ObjectId.isValid(value)) {
              throw new Error(TWEETS_MESSAGES.TWEET_ID_INVALID)
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const deleteTweetValidator = validate(
  checkSchema(
    {
      tweet_id: {
        notEmpty: {
          errorMessage: TWEETS_MESSAGES.TWEET_ID_REQUIRED
        },
        custom: {
          options: async (value) => {
            if (!ObjectId.isValid(value)) {
              throw new Error(TWEETS_MESSAGES.TWEET_ID_INVALID)
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const audienceValidator = wrapRequestHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tweet_id } = req.params
    const tweet = await databaseService.tweets.findOne({
      _id: new ObjectId(tweet_id as string)
    })
    if (!tweet) {
      throw new ErrorWithStatus({
        message: TWEETS_MESSAGES.TWEET_NOT_FOUND,
        status: httpStatus.NOT_FOUND
      })
    }
    if (tweet.audience === TweetAudience.Everyone) {
      return next()
    }
    const { user_id } = req.decoded_authorization as { user_id: string }
    if (!user_id) {
      throw new ErrorWithStatus({
        message: AUTH_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
        status: httpStatus.UNAUTHORIZED
      })
    }
    if (tweet.user_id.equals(new ObjectId(user_id))) {
      return next()
    }
    const author = await databaseService.users.findOne(
      {
        _id: tweet.user_id
      },
      {
        projection: { twitter_circle: 1 }
      }
    )
    const isInTwitterCircle = author?.twitter_circle.some((id: ObjectId) =>
      id.equals(new ObjectId(user_id))
    )
    if (!isInTwitterCircle) {
      throw new ErrorWithStatus({
        message: TWEETS_MESSAGES.IS_NOT_PUBLIC,
        status: httpStatus.FORBIDDEN
      })
    }
    next()
  }
)
