import { TokenPayload } from '@/@types/express.js'
import { envConfig } from '@/config/env.js'
import { UserVerifyStatus } from '@/constants/enums.js'
import httpStatus from '@/constants/httpStatus.js'
import { AUTH_MESSAGES, USERS_MESSAGES } from '@/constants/messages.js'
import { ErrorWithStatus } from '@/models/Errors.js'
import databaseService from '@/services/database.services.js'
import usersService from '@/services/users.services.js'
import { comparePassword } from '@/utils/crypto.js'
import { verifyToken } from '@/utils/jwt.js'
import { validate } from '@/utils/validation.js'
import { NextFunction, Request, Response } from 'express'

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
      date_of_birth: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_IS_REQUIRED
        },
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_IS_REQUIRED
        },
        custom: {
          options: (value) => {
            const date = new Date(value)
            const now = new Date()
            if (date > now) {
              throw new Error(USERS_MESSAGES.DATE_OF_BIRTH_MUST_BE_IN_PAST)
            }
            return true
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
              throw new ErrorWithStatus({
                message: AUTH_MESSAGES.INVALID_EMAIL_OR_PASSWORD,
                status: httpStatus.UNAUTHORIZED
              })
            }
            const isMatch = await comparePassword(
              req.body.password,
              user.password
            )
            if (!isMatch) {
              throw new ErrorWithStatus({
                message: AUTH_MESSAGES.INVALID_EMAIL_OR_PASSWORD,
                status: httpStatus.UNAUTHORIZED
              })
            }
            console.log('email_verify_token', user.email_verify_token)
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
          errorMessage: new ErrorWithStatus({
            message: AUTH_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
            status: httpStatus.UNAUTHORIZED
          })
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
                token: access_token,
                secretKey: envConfig.JWT_SECRET_ACCESS_TOKEN
              })

              request.decoded_authorization = decoded_authorization
              return true
            } catch {
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
          errorMessage: new ErrorWithStatus({
            message: AUTH_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
            status: httpStatus.UNAUTHORIZED
          })
        },
        custom: {
          options: async (value: string, { req }) => {
            const request = req as Request
            try {
              const [decoded_refresh_token, refresh_token_doc] =
                await Promise.all([
                  verifyToken({
                    token: value,
                    secretKey: envConfig.JWT_SECRET_REFRESH_TOKEN
                  }),
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
                refresh_token_doc.user_id.toString()
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

export const verifyEmailTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        notEmpty: {
          errorMessage: new ErrorWithStatus({
            message: AUTH_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
            status: httpStatus.UNAUTHORIZED
          })
        },
        custom: {
          options: async (value: string, { req }) => {
            const request = req as Request
            try {
              const decoded_email_verify_token = await verifyToken({
                token: value,
                secretKey: envConfig.JWT_SECRET_VERIFY_EMAIL_TOKEN
              })
              request.decoded_email_verify_token = decoded_email_verify_token
            } catch {
              throw new ErrorWithStatus({
                message: AUTH_MESSAGES.EMAIL_VERIFY_TOKEN_IS_INVALID,
                status: httpStatus.UNAUTHORIZED
              })
            }
          }
        }
      },
      refresh_token: {
        notEmpty: {
          errorMessage: new ErrorWithStatus({
            message: AUTH_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
            status: httpStatus.UNAUTHORIZED
          })
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.INVALID_EMAIL_FORMAT
        },
        normalizeEmail: true,
        trim: true
      }
    },
    ['body']
  )
)

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        notEmpty: {
          errorMessage: new ErrorWithStatus({
            message: AUTH_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
            status: httpStatus.UNAUTHORIZED
          })
        },
        custom: {
          options: async (value: string, { req }) => {
            const request = req as Request
            try {
              const decoded_forgot_password_token = await verifyToken({
                token: value,
                secretKey: envConfig.JWT_SECRET_FORGOT_PASSWORD_TOKEN
              })
              request.decoded_forgot_password_token =
                decoded_forgot_password_token
              return true
            } catch {
              throw new ErrorWithStatus({
                message: AUTH_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID,
                status: httpStatus.UNAUTHORIZED
              })
            }
          }
        }
      }
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        notEmpty: {
          errorMessage: new ErrorWithStatus({
            message: AUTH_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
            status: httpStatus.UNAUTHORIZED
          })
        },
        custom: {
          options: async (value: string, { req }) => {
            const request = req as Request
            try {
              const decoded_forgot_password_token = await verifyToken({
                token: value,
                secretKey: envConfig.JWT_SECRET_FORGOT_PASSWORD_TOKEN
              })
              request.decoded_forgot_password_token =
                decoded_forgot_password_token
              return true
            } catch {
              throw new ErrorWithStatus({
                message: AUTH_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID,
                status: httpStatus.UNAUTHORIZED
              })
            }
          }
        }
      },
      new_password: {
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
      confirm_new_password: {
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
            if (value !== req.body.new_password) {
              throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MISMATCH)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifiedUserValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { verify } = req.decoded_authorization as TokenPayload
  if (verify !== UserVerifyStatus.Verified) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_VERIFIED,
      status: httpStatus.FORBIDDEN
    })
  }
  next()
}

export const updateMeBodyValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.BODY_MUST_BE_JSON_OBJECT,
      status: httpStatus.BAD_REQUEST
    })
  }

  const allowedFields = [
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]
  const bodyKeys = Object.keys(req.body)

  if (bodyKeys.length === 0) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.NO_FIELDS_TO_UPDATE,
      status: httpStatus.BAD_REQUEST
    })
  }

  const invalidFields = bodyKeys.filter((key) => !allowedFields.includes(key))

  if (invalidFields.length > 0) {
    throw new ErrorWithStatus({
      message: `Invalid fields in request body: ${invalidFields.join(', ')}`,
      status: httpStatus.BAD_REQUEST
    })
  }

  next()
}

export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.NAME_MUST_BE_STRING
        },
        isLength: {
          options: { min: 1, max: 50 },
          errorMessage: USERS_MESSAGES.NAME_LENGTH
        },
        trim: true
      },
      date_of_birth: {
        optional: true,
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: USERS_MESSAGES.INVALID_DATE_OF_BIRTH_FORMAT
        },
        custom: {
          options: (value) => {
            const date = new Date(value)
            const now = new Date()
            if (date > now) {
              throw new Error(USERS_MESSAGES.DATE_OF_BIRTH_MUST_BE_IN_PAST)
            }
            return true
          }
        }
      },
      bio: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.BIO_MUST_BE_STRING
        },
        isLength: {
          options: { max: 160 },
          errorMessage: USERS_MESSAGES.BIO_LENGTH
        },
        trim: true
      },
      location: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.LOCATION_MUST_BE_STRING
        },
        isLength: {
          options: { max: 160 },
          errorMessage: USERS_MESSAGES.LOCATION_LENGTH
        },
        trim: true
      },
      website: {
        optional: true,
        isURL: {
          errorMessage: USERS_MESSAGES.WEBSITE_MUST_BE_VALID_URL
        },
        trim: true
      },
      username: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.USERNAME_MUST_BE_STRING
        },
        isLength: {
          options: { min: 2, max: 50 },
          errorMessage: USERS_MESSAGES.USERNAME_LENGTH
        },
        matches: {
          options: /^[a-zA-Z0-9_]+$/,
          errorMessage: USERS_MESSAGES.USERNAME_INVALID_CHARACTERS
        },
        custom: {
          options: async (value: string, { req }) => {
            const existingUser = await databaseService.users.findOne({
              username: value
            })
            if (
              existingUser &&
              existingUser._id.toString() !==
                (req as Request).decoded_authorization?.user_id
            ) {
              throw new Error(USERS_MESSAGES.USERNAME_ALREADY_EXISTS)
            }
            return true
          }
        },
        trim: true
      },
      avatar: {
        optional: true,
        isURL: {
          errorMessage: USERS_MESSAGES.AVATAR_MUST_BE_VALID_URL
        },
        trim: true
      },
      cover_photo: {
        optional: true,
        isURL: {
          errorMessage: USERS_MESSAGES.COVER_PHOTO_MUST_BE_VALID_URL
        },
        trim: true
      }
    },
    ['body']
  )
)

export const getUserProfileValidator = validate(
  checkSchema(
    {
      username: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.USERNAME_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.USERNAME_MUST_BE_STRING
        },
        isLength: {
          options: { min: 2, max: 50 },
          errorMessage: USERS_MESSAGES.USERNAME_LENGTH
        },
        matches: {
          options: /^[a-zA-Z0-9_]+$/,
          errorMessage: USERS_MESSAGES.USERNAME_INVALID_CHARACTERS
        },
        trim: true
      }
    },
    ['params']
  )
)

export const followValidator = validate(
  checkSchema(
    {
      user_id: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.USERID_IS_REQUIRED
        },
        isMongoId: {
          errorMessage: USERS_MESSAGES.USERID_INVALID
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = req.decoded_authorization as TokenPayload
            if (user_id === value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.CANNOT_FOLLOW_YOURSELF,
                status: httpStatus.BAD_REQUEST
              })
            }
          }
        }
      }
    },
    ['params']
  )
)

export const changePasswordValidator = validate(
  checkSchema(
    {
      current_password: {
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
      },
      new_password: {
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
      confirm_new_password: {
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
            if (value !== req.body.new_password) {
              throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MISMATCH)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const isUserLoggedInValidator = (
  middleware: (req: Request, res: Response, next: NextFunction) => void
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      return middleware(req, res, next)
    } else {
      next()
    }
  }
}
