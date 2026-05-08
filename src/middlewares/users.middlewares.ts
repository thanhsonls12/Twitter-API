/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from '@/constants/httpStatus.js'
import { AUTH_MESSAGES, USERS_MESSAGES } from '@/constants/messages.js'
import { ErrorWithStatus } from '@/models/Errors.js'
import databaseService from '@/services/database.services.js'
import usersService from '@/services/users.services.js'
import { comparePassword, hashPassword } from '@/utils/crypto.js'
import { verifyToken } from '@/utils/jwt.js'
import { validate } from '@/utils/validation.js'
import { Request } from 'express'

import { checkSchema } from 'express-validator'

export const registerValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.NAME_MUST_BE_STRING
        },
        isLength: {
          options: { min: 1, max: 50 },
          errorMessage: USERS_MESSAGES.NAME_LENGTH
        },
        trim: true
      },
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.INVALID_EMAIL_FORMAT
        },
        normalizeEmail: true,
        trim: true,
        custom: {
          options: async (value) => {
            const isEmailExists = await usersService.checkEmailExists(value)
            if (isEmailExists) {
              throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
            }
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRING
        },
        isLength: {
          options: { min: 6, max: 50 },
          errorMessage: USERS_MESSAGES.PASSWORD_LENGTH
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USERS_MESSAGES.PASSWORD_STRENGTH
        }
      },
      confirm_password: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRING
        },
        isLength: {
          options: { min: 6, max: 50 },
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH
        },

        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MISMATCH)
            }
            return true
          },
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MISMATCH
        }
      },
      day_of_birth: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.DAY_OF_BIRTH_IS_REQUIRED
        },
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          }
        }
      }
    },
    ['body']
  )
)

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.INVALID_EMAIL_FORMAT
        },
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value
            })
            if (user === null) {
              throw new Error(AUTH_MESSAGES.INVALID_EMAIL_OR_PASSWORD)
            }
            const isMatch = await comparePassword(
              req.body.password,
              user.password
            )
            if (!isMatch) {
              throw new Error(AUTH_MESSAGES.INVALID_EMAIL_OR_PASSWORD)
            }
            req.user = user
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRING
        },
        isLength: {
          options: { min: 6, max: 50 },
          errorMessage: USERS_MESSAGES.PASSWORD_LENGTH
        }
      }
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      authorization: {
        notEmpty: {
          errorMessage: AUTH_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (values: string, { req }) => {
            const request = req as Request
            const access_token = values.split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: AUTH_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: httpStatus.UNAUTHORIZED
              })
            }
            try {
              const decoded_authorization = await verifyToken({
                token: access_token
              })
              request.decoded_authorization = decoded_authorization
              return true
            } catch (error) {
              throw new ErrorWithStatus({
                message: AUTH_MESSAGES.ACCESS_TOKEN_IS_INVALID,
                status: httpStatus.UNAUTHORIZED
              })
            }
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: {
          errorMessage: AUTH_MESSAGES.REFRESH_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            const request = req as Request
            try {
              const [decoded_refresh_token, refresh_token_doc] =
                await Promise.all([
                  verifyToken({ token: value }),
                  databaseService.refreshTokens.findOne({ token: value })
                ])
              if (!refresh_token_doc) {
                throw new ErrorWithStatus({
                  message: AUTH_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXISTS,
                  status: httpStatus.UNAUTHORIZED
                })
              }
              if (
                decoded_refresh_token.user_id !==
                request.decoded_authorization?.user_id
              ) {
                throw new ErrorWithStatus({
                  message: AUTH_MESSAGES.REFRESH_TOKEN_IS_INVALID,
                  status: httpStatus.UNAUTHORIZED
                })
              }
              request.decoded_refresh_token = decoded_refresh_token
            } catch (error) {
              if (error instanceof ErrorWithStatus) {
                throw error
              }
              throw new ErrorWithStatus({
                message: AUTH_MESSAGES.REFRESH_TOKEN_IS_INVALID,
                status: httpStatus.UNAUTHORIZED
              })
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)
