import { validate } from '@/utils/validation.js'
import { checkSchema } from 'express-validator'
import { SEARCH_MESSAGES } from '@/constants/messages.js'
import { MediaType } from '@/constants/enums.js'

export const searchValidator = validate(
  checkSchema(
    {
      q: {
        in: ['query'],
        isString: {
          errorMessage: SEARCH_MESSAGES.SEARCH_QUERY_MUST_BE_STRING
        },
        trim: true,
        notEmpty: {
          errorMessage: SEARCH_MESSAGES.SEARCH_QUERY_REQUIRED
        },
        isLength: {
          options: { min: 1, max: 100 },
          errorMessage: SEARCH_MESSAGES.SEARCH_QUERY_LENGTH
        }
      },
      page: {
        in: ['query'],
        optional: true,
        isInt: {
          options: { min: 1 },
          errorMessage: SEARCH_MESSAGES.PAGE_MUST_BE_INTEGER_AND_GREATER_THAN_0
        },
        toInt: true
      },
      limit: {
        in: ['query'],
        optional: true,
        isInt: {
          options: { min: 1, max: 100 },
          errorMessage:
            SEARCH_MESSAGES.LIMIT_MUST_BE_INTEGER_AND_BETWEEN_1_AND_100
        },
        toInt: true
      },
      media_type: {
        in: ['query'],
        optional: true,
        isIn: {
          options: [
            Object.values(MediaType).filter(
              (value) => typeof value === 'number'
            )
          ],
          errorMessage: SEARCH_MESSAGES.MEDIA_TYPE_INVALID
        },
        toInt: true
      },
      people_follow: {
        in: ['query'],
        optional: true,
        isIn: {
          options: [[0, 1]],
          errorMessage: SEARCH_MESSAGES.PEOPLE_FOLLOW_INVALID
        },
        toInt: true
      }
    },
    ['query']
  )
)
