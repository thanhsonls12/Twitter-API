import { MediaType, TweetAudience, TweetType } from '@/constants/enums.js'
import { TWEETS_MESSAGES } from '@/constants/messages.js'
import { Media } from '@/models/Other.js'
import { numberEnumToArray } from '@/utils/commons.js'
import { validate } from '@/utils/validation.js'
import { checkSchema } from 'express-validator'
import isEmpty from 'lodash/isEmpty.js'

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
        isIn: {
          options: [tweetTypes],
          errorMessage: TWEETS_MESSAGES.INVALID_TYPE
        }
      },
      audience: {
        notEmpty: {
          errorMessage: TWEETS_MESSAGES.AUDIENCE_REQUIRED
        },
        isIn: {
          options: [tweetAudiences],
          errorMessage: TWEETS_MESSAGES.INVALID_AUDIENCE
        }
      },
      parent_id: {
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetType
            if (
              [
                TweetType.Comment,
                TweetType.QuoteTweet,
                TweetType.Retweet
              ].includes(type) &&
              typeof value !== 'string'
            ) {
              throw new Error(
                TWEETS_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID
              )
            }
            if (type === TweetType.Tweet && value !== null && value !== undefined) {
              throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_NULL)
            }
            return true
          }
        }
      },
      content: {
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
            if (!value.every((mention: any) => typeof mention === 'string')) {
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
