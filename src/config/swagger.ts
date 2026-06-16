import { envConfig } from '@/config/env.js'
import type { Express } from 'express'
import swaggerUi from 'swagger-ui-express'

const objectId = {
  type: 'string',
  pattern: '^[a-fA-F0-9]{24}$',
  example: '665f1b2c3d4e5f6789012345'
}

const messageResponse = (description: string) => ({
  description,
  content: {
    'application/json': {
      schema: {
        $ref: '#/components/schemas/MessageResponse'
      }
    }
  }
})

const dataResponse = (description: string) => ({
  description,
  content: {
    'application/json': {
      schema: {
        $ref: '#/components/schemas/DataResponse'
      }
    }
  }
})

const resultResponse = (description: string) => ({
  description,
  content: {
    'application/json': {
      schema: {
        $ref: '#/components/schemas/ResultResponse'
      }
    }
  }
})

const validationErrorResponse = {
  description: 'Validation error',
  content: {
    'application/json': {
      schema: {
        $ref: '#/components/schemas/ValidationError'
      }
    }
  }
}

const unauthorizedResponse = {
  description: 'Unauthorized or invalid token',
  content: {
    'application/json': {
      schema: {
        $ref: '#/components/schemas/ErrorResponse'
      }
    }
  }
}

const forbiddenResponse = {
  description: 'Forbidden',
  content: {
    'application/json': {
      schema: {
        $ref: '#/components/schemas/ErrorResponse'
      }
    }
  }
}

const notFoundResponse = {
  description: 'Resource not found',
  content: {
    'application/json': {
      schema: {
        $ref: '#/components/schemas/ErrorResponse'
      }
    }
  }
}

const bearerSecurity = [{ BearerAuth: [] }]

const pageParam = {
  in: 'query',
  name: 'page',
  required: false,
  schema: { type: 'integer', minimum: 1, default: 1 }
}

const limitParam = {
  in: 'query',
  name: 'limit',
  required: false,
  schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
}

const tweetIdParam = {
  in: 'path',
  name: 'tweet_id',
  required: true,
  schema: objectId
}

const userIdParam = {
  in: 'path',
  name: 'user_id',
  required: true,
  schema: objectId
}

export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Twitter Clone API',
    version: '1.0.0',
    description: 'OpenAPI documentation for the Twitter Clone Express API.'
  },
  servers: [
    {
      url: `http://localhost:${envConfig.PORT}`,
      description: 'Local development server'
    }
  ],
  tags: [
    { name: 'Auth', description: 'Authentication and password recovery' },
    { name: 'Users', description: 'User profile and relationships' },
    { name: 'Tweets', description: 'Tweet creation, feed and details' },
    { name: 'Medias', description: 'Media upload and static serving' },
    { name: 'Bookmarks', description: 'Tweet bookmarks' },
    { name: 'Likes', description: 'Tweet likes' },
    { name: 'Twitter Circle', description: 'Private audience management' },
    { name: 'Search', description: 'Search users and tweets' },
    { name: 'Conversations', description: 'Conversation and messages' }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Unauthorized' }
        }
      },
      ValidationError: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Validation error' },
          errors: { type: 'object', additionalProperties: true }
        }
      },
      MessageResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Success' }
        }
      },
      DataResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Success' },
          data: { type: 'object', additionalProperties: true }
        }
      },
      ResultResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Success' },
          result: { type: 'object', additionalProperties: true }
        }
      },
      TokenPair: {
        type: 'object',
        properties: {
          access_token: { type: 'string' },
          refresh_token: { type: 'string' }
        }
      },
      AuthData: {
        allOf: [
          { $ref: '#/components/schemas/TokenPair' },
          {
            type: 'object',
            properties: {
              user_id: objectId
            }
          }
        ]
      },
      AuthResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Login success' },
          data: { $ref: '#/components/schemas/AuthData' }
        }
      },
      Media: {
        type: 'object',
        required: ['url', 'type'],
        properties: {
          url: { type: 'string', format: 'uri' },
          type: {
            type: 'integer',
            enum: [0, 1, 2],
            description: '0: Image, 1: Video, 2: VideoHLS'
          }
        }
      },
      User: {
        type: 'object',
        properties: {
          _id: objectId,
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          username: { type: 'string' },
          date_of_birth: { type: 'string', format: 'date-time' },
          bio: { type: 'string' },
          location: { type: 'string' },
          website: { type: 'string' },
          avatar: { type: 'string' },
          cover_photo: { type: 'string' },
          verify: {
            type: 'integer',
            enum: [0, 1, 2],
            description: '0: Unverified, 1: Verified, 2: Banned'
          }
        }
      },
      Tweet: {
        type: 'object',
        properties: {
          _id: objectId,
          user_id: objectId,
          type: {
            type: 'integer',
            enum: [0, 1, 2, 3],
            description: '0: Tweet, 1: Retweet, 2: Comment, 3: QuoteTweet'
          },
          audience: {
            type: 'integer',
            enum: [0, 1],
            description: '0: Everyone, 1: TwitterCircle'
          },
          content: { type: 'string', maxLength: 280 },
          parent_id: { ...objectId, nullable: true },
          hashtags: { type: 'array', items: { type: 'string' } },
          mentions: { type: 'array', items: objectId },
          medias: { type: 'array', items: { $ref: '#/components/schemas/Media' } },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password', 'confirm_password', 'date_of_birth'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 50, example: 'Nguyen Van A' },
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          password: { type: 'string', minLength: 6, maxLength: 50, example: 'Password@123' },
          confirm_password: { type: 'string', minLength: 6, maxLength: 50, example: 'Password@123' },
          date_of_birth: { type: 'string', format: 'date-time', example: '2000-01-01T00:00:00.000Z' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          password: { type: 'string', example: 'Password@123' }
        }
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refresh_token'],
        properties: { refresh_token: { type: 'string' } }
      },
      VerifyEmailRequest: {
        type: 'object',
        required: ['email_verify_token', 'refresh_token'],
        properties: {
          email_verify_token: { type: 'string' },
          refresh_token: { type: 'string' }
        }
      },
      ForgotPasswordRequest: {
        type: 'object',
        required: ['email'],
        properties: { email: { type: 'string', format: 'email' } }
      },
      VerifyForgotPasswordRequest: {
        type: 'object',
        required: ['forgot_password_token'],
        properties: { forgot_password_token: { type: 'string' } }
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['forgot_password_token', 'new_password', 'confirm_new_password'],
        properties: {
          forgot_password_token: { type: 'string' },
          new_password: { type: 'string', minLength: 6, maxLength: 50, example: 'NewPassword@123' },
          confirm_new_password: { type: 'string', example: 'NewPassword@123' }
        }
      },
      UpdateMeRequest: {
        type: 'object',
        minProperties: 1,
        additionalProperties: false,
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 50 },
          date_of_birth: { type: 'string', format: 'date-time' },
          bio: { type: 'string' },
          location: { type: 'string' },
          website: { type: 'string' },
          username: { type: 'string' },
          avatar: { type: 'string' },
          cover_photo: { type: 'string' }
        }
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['current_password', 'new_password', 'confirm_new_password'],
        properties: {
          current_password: { type: 'string' },
          new_password: { type: 'string', minLength: 6, maxLength: 50, example: 'NewPassword@123' },
          confirm_new_password: { type: 'string', example: 'NewPassword@123' }
        }
      },
      TweetRequest: {
        type: 'object',
        required: ['type', 'audience', 'content'],
        properties: {
          type: {
            type: 'integer',
            enum: [0, 1, 2, 3],
            description: '0: Tweet, 1: Retweet, 2: Comment, 3: QuoteTweet'
          },
          audience: {
            type: 'integer',
            enum: [0, 1],
            description: '0: Everyone, 1: TwitterCircle'
          },
          content: { type: 'string', maxLength: 280, example: 'Hello Twitter Clone' },
          parent_id: { ...objectId, nullable: true },
          hashtags: { type: 'array', items: { type: 'string' }, example: ['nodejs'] },
          mentions: { type: 'array', items: objectId },
          medias: { type: 'array', items: { $ref: '#/components/schemas/Media' } }
        }
      },
      TweetIdRequest: {
        type: 'object',
        required: ['tweet_id'],
        properties: { tweet_id: objectId }
      },
      UserIdRequest: {
        type: 'object',
        required: ['user_id'],
        properties: { user_id: objectId }
      },
      ConversationRequest: {
        type: 'object',
        required: ['receiver_id'],
        properties: { receiver_id: objectId }
      }
    }
  },
  paths: {
    '/users/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } }
        },
        responses: {
          '201': { description: 'Registered successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '422': validationErrorResponse
        }
      }
    },
    '/users/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email and password',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } }
        },
        responses: {
          '200': { description: 'Login successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '401': unauthorizedResponse,
          '422': validationErrorResponse
        }
      }
    },
    '/users/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout current session',
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshTokenRequest' } } }
        },
        responses: { '200': messageResponse('Logged out successfully'), '401': unauthorizedResponse, '422': validationErrorResponse }
      }
    },
    '/users/refresh-token': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access and refresh tokens',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshTokenRequest' } } }
        },
        responses: { '200': dataResponse('Tokens refreshed successfully'), '401': unauthorizedResponse, '422': validationErrorResponse }
      }
    },
    '/users/verify-email': {
      post: {
        tags: ['Auth'],
        summary: 'Verify email using token',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyEmailRequest' } } }
        },
        responses: { '200': messageResponse('Email verified successfully'), '401': unauthorizedResponse, '422': validationErrorResponse }
      }
    },
    '/users/resend-verify-email': {
      post: {
        tags: ['Auth'],
        summary: 'Resend email verification link',
        security: bearerSecurity,
        responses: { '200': messageResponse('Verification email sent'), '401': unauthorizedResponse }
      }
    },
    '/users/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Send forgot password email',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ForgotPasswordRequest' } } }
        },
        responses: { '200': messageResponse('Forgot password email sent'), '422': validationErrorResponse }
      }
    },
    '/users/verify-forgot-password-token': {
      post: {
        tags: ['Auth'],
        summary: 'Verify forgot password token',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyForgotPasswordRequest' } } }
        },
        responses: { '200': messageResponse('Forgot password token verified'), '401': unauthorizedResponse, '422': validationErrorResponse }
      }
    },
    '/users/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ResetPasswordRequest' } } }
        },
        responses: { '200': messageResponse('Password reset successfully'), '401': unauthorizedResponse, '422': validationErrorResponse }
      }
    },
    '/users/oauth/google': {
      get: {
        tags: ['Auth'],
        summary: 'Start Google OAuth flow',
        responses: { '302': { description: 'Redirect to Google OAuth consent screen' } }
      }
    },
    '/users/oauth/google/callback': {
      get: {
        tags: ['Auth'],
        summary: 'Google OAuth callback',
        responses: { '302': { description: 'Redirect to client OAuth callback with tokens' }, '401': unauthorizedResponse }
      }
    },
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Get current user',
        security: bearerSecurity,
        responses: { '200': dataResponse('Current user fetched successfully'), '401': unauthorizedResponse }
      },
      patch: {
        tags: ['Users'],
        summary: 'Update current user',
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateMeRequest' } } }
        },
        responses: { '200': dataResponse('User updated successfully'), '400': validationErrorResponse, '401': unauthorizedResponse, '403': forbiddenResponse, '422': validationErrorResponse }
      }
    },
    '/users/change-password': {
      put: {
        tags: ['Users'],
        summary: 'Change current user password',
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordRequest' } } }
        },
        responses: { '200': messageResponse('Password changed successfully'), '401': unauthorizedResponse, '403': forbiddenResponse, '422': validationErrorResponse }
      }
    },
    '/users/{username}': {
      get: {
        tags: ['Users'],
        summary: 'Get public user profile by username',
        parameters: [{ in: 'path', name: 'username', required: true, schema: { type: 'string' } }],
        responses: { '200': dataResponse('User profile fetched successfully'), '404': notFoundResponse, '422': validationErrorResponse }
      }
    },
    '/users/{user_id}/follow': {
      post: {
        tags: ['Users'],
        summary: 'Follow a user',
        security: bearerSecurity,
        parameters: [userIdParam],
        responses: { '200': messageResponse('Followed successfully'), '401': unauthorizedResponse, '403': forbiddenResponse, '422': validationErrorResponse }
      },
      delete: {
        tags: ['Users'],
        summary: 'Unfollow a user',
        security: bearerSecurity,
        parameters: [userIdParam],
        responses: { '200': messageResponse('Unfollowed successfully'), '401': unauthorizedResponse, '403': forbiddenResponse, '422': validationErrorResponse }
      }
    },
    '/tweets': {
      post: {
        tags: ['Tweets'],
        summary: 'Create a tweet, retweet, comment or quote tweet',
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TweetRequest' } } }
        },
        responses: { '201': resultResponse('Tweet created successfully'), '401': unauthorizedResponse, '403': forbiddenResponse, '422': validationErrorResponse }
      }
    },
    '/tweets/new-feeds': {
      get: {
        tags: ['Tweets'],
        summary: 'Get new feeds for current user',
        security: bearerSecurity,
        parameters: [pageParam, limitParam],
        responses: { '200': resultResponse('New feeds fetched successfully'), '401': unauthorizedResponse, '403': forbiddenResponse, '422': validationErrorResponse }
      }
    },
    '/tweets/{tweet_id}': {
      get: {
        tags: ['Tweets'],
        summary: 'Get tweet detail',
        description: 'Bearer token is optional for public tweets and required for Twitter Circle tweets.',
        security: bearerSecurity,
        parameters: [tweetIdParam],
        responses: { '200': resultResponse('Tweet fetched successfully'), '401': unauthorizedResponse, '403': forbiddenResponse, '404': notFoundResponse, '422': validationErrorResponse }
      },
      delete: {
        tags: ['Tweets'],
        summary: 'Delete own tweet',
        security: bearerSecurity,
        parameters: [tweetIdParam],
        responses: { '200': resultResponse('Tweet deleted successfully'), '401': unauthorizedResponse, '403': forbiddenResponse, '422': validationErrorResponse }
      }
    },
    '/tweets/{tweet_id}/children': {
      get: {
        tags: ['Tweets'],
        summary: 'Get tweet children',
        description: 'Returns comments, quote tweets or retweets for a parent tweet.',
        security: bearerSecurity,
        parameters: [
          tweetIdParam,
          { in: 'query', name: 'type', required: false, schema: { type: 'integer', enum: [1, 2, 3] }, description: '1: Retweet, 2: Comment, 3: QuoteTweet' },
          pageParam,
          limitParam
        ],
        responses: { '200': resultResponse('Tweet children fetched successfully'), '401': unauthorizedResponse, '403': forbiddenResponse, '422': validationErrorResponse }
      }
    },
    '/medias/upload-image': {
      post: {
        tags: ['Medias'],
        summary: 'Upload image files',
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: { 'multipart/form-data': { schema: { type: 'object', required: ['image'], properties: { image: { type: 'array', items: { type: 'string', format: 'binary' } } } } } }
        },
        responses: { '200': resultResponse('Images uploaded successfully'), '401': unauthorizedResponse, '403': forbiddenResponse }
      }
    },
    '/medias/upload-video': {
      post: {
        tags: ['Medias'],
        summary: 'Upload video files',
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: { 'multipart/form-data': { schema: { type: 'object', required: ['video'], properties: { video: { type: 'array', items: { type: 'string', format: 'binary' } } } } } }
        },
        responses: { '200': resultResponse('Videos uploaded successfully'), '401': unauthorizedResponse, '403': forbiddenResponse }
      }
    },
    '/medias/upload-video-hls': {
      post: {
        tags: ['Medias'],
        summary: 'Upload video and queue HLS conversion',
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: { 'multipart/form-data': { schema: { type: 'object', required: ['video'], properties: { video: { type: 'array', items: { type: 'string', format: 'binary' } } } } } }
        },
        responses: { '200': resultResponse('Video uploaded and queued for HLS conversion'), '401': unauthorizedResponse, '403': forbiddenResponse }
      }
    },
    '/medias/video-status/{id}': {
      get: {
        tags: ['Medias'],
        summary: 'Get video HLS encoding status',
        security: bearerSecurity,
        parameters: [{ in: 'path', name: 'id', required: true, schema: objectId }],
        responses: { '200': { description: 'Video status fetched successfully' }, '401': unauthorizedResponse, '403': forbiddenResponse }
      }
    },
    '/images/{filename}': {
      get: {
        tags: ['Medias'],
        summary: 'Serve uploaded image',
        parameters: [{ in: 'path', name: 'filename', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Image file' }, '404': notFoundResponse }
      }
    },
    '/videos/{filename}': {
      get: {
        tags: ['Medias'],
        summary: 'Stream uploaded video file',
        parameters: [
          { in: 'path', name: 'filename', required: true, schema: { type: 'string' } },
          { in: 'header', name: 'Range', required: true, schema: { type: 'string', example: 'bytes=0-' } }
        ],
        responses: { '206': { description: 'Partial video content' }, '400': validationErrorResponse, '404': notFoundResponse }
      }
    },
    '/bookmarks': {
      get: {
        tags: ['Bookmarks'],
        summary: 'Get current user bookmarks',
        security: bearerSecurity,
        responses: { '200': resultResponse('Bookmarks fetched successfully'), '401': unauthorizedResponse, '403': forbiddenResponse }
      },
      post: {
        tags: ['Bookmarks'],
        summary: 'Bookmark a tweet',
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TweetIdRequest' } } }
        },
        responses: { '201': resultResponse('Bookmark created successfully'), '401': unauthorizedResponse, '403': forbiddenResponse, '422': validationErrorResponse }
      }
    },
    '/bookmarks/{tweet_id}': {
      delete: {
        tags: ['Bookmarks'],
        summary: 'Remove tweet bookmark',
        security: bearerSecurity,
        parameters: [tweetIdParam],
        responses: { '200': resultResponse('Bookmark deleted successfully'), '401': unauthorizedResponse, '403': forbiddenResponse, '422': validationErrorResponse }
      }
    },
    '/likes': {
      get: {
        tags: ['Likes'],
        summary: 'Get current user liked tweets',
        security: bearerSecurity,
        responses: { '200': resultResponse('Likes fetched successfully'), '401': unauthorizedResponse, '403': forbiddenResponse }
      },
      post: {
        tags: ['Likes'],
        summary: 'Like a tweet',
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TweetIdRequest' } } }
        },
        responses: { '201': resultResponse('Like created successfully'), '401': unauthorizedResponse, '403': forbiddenResponse, '422': validationErrorResponse }
      }
    },
    '/likes/{tweet_id}': {
      delete: {
        tags: ['Likes'],
        summary: 'Unlike a tweet',
        security: bearerSecurity,
        parameters: [tweetIdParam],
        responses: { '200': resultResponse('Like deleted successfully'), '401': unauthorizedResponse, '403': forbiddenResponse, '422': validationErrorResponse }
      }
    },
    '/twitter-circle': {
      post: {
        tags: ['Twitter Circle'],
        summary: 'Add a user to current user Twitter Circle',
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UserIdRequest' } } }
        },
        responses: { '200': resultResponse('User added to circle'), '401': unauthorizedResponse, '403': forbiddenResponse, '422': validationErrorResponse }
      }
    },
    '/twitter-circle/{user_id}': {
      delete: {
        tags: ['Twitter Circle'],
        summary: 'Remove a user from current user Twitter Circle',
        security: bearerSecurity,
        parameters: [userIdParam],
        responses: { '200': resultResponse('User removed from circle'), '401': unauthorizedResponse, '403': forbiddenResponse, '422': validationErrorResponse }
      }
    },
    '/search/users': {
      get: {
        tags: ['Search'],
        summary: 'Search users',
        parameters: [
          { in: 'query', name: 'q', required: true, schema: { type: 'string', minLength: 1, maxLength: 100 } },
          pageParam,
          limitParam
        ],
        responses: { '200': resultResponse('Users fetched successfully'), '422': validationErrorResponse }
      }
    },
    '/search/tweets': {
      get: {
        tags: ['Search'],
        summary: 'Search tweets',
        description: 'Bearer token is optional and improves access to protected tweets when present.',
        security: bearerSecurity,
        parameters: [
          { in: 'query', name: 'q', required: true, schema: { type: 'string', minLength: 1, maxLength: 100 } },
          pageParam,
          limitParam,
          { in: 'query', name: 'media_type', required: false, schema: { type: 'integer', enum: [0, 1, 2] }, description: '0: Image, 1: Video, 2: VideoHLS' },
          { in: 'query', name: 'people_follow', required: false, schema: { type: 'integer', enum: [0, 1] }, description: '1 filters by followed people' }
        ],
        responses: { '200': resultResponse('Tweets fetched successfully'), '401': unauthorizedResponse, '403': forbiddenResponse, '422': validationErrorResponse }
      }
    },
    '/conversations': {
      get: {
        tags: ['Conversations'],
        summary: 'Get current user conversations',
        security: bearerSecurity,
        responses: { '200': resultResponse('Conversations fetched successfully'), '401': unauthorizedResponse, '403': forbiddenResponse }
      },
      post: {
        tags: ['Conversations'],
        summary: 'Create or get conversation with receiver',
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ConversationRequest' } } }
        },
        responses: { '201': resultResponse('Conversation created successfully'), '401': unauthorizedResponse, '403': forbiddenResponse, '422': validationErrorResponse }
      }
    },
    '/conversations/{conversation_id}/messages': {
      get: {
        tags: ['Conversations'],
        summary: 'Get messages in a conversation',
        security: bearerSecurity,
        parameters: [
          { in: 'path', name: 'conversation_id', required: true, schema: objectId },
          limitParam,
          { in: 'query', name: 'cursor', required: false, schema: { type: 'string' }, description: 'Pagination cursor' }
        ],
        responses: { '200': resultResponse('Messages fetched successfully'), '401': unauthorizedResponse, '403': forbiddenResponse, '422': validationErrorResponse }
      }
    }
  }
} as const

export function setupSwagger(app: Express) {
  app.get('/swagger.json', (_req, res) => {
    res.json(swaggerDocument)
  })

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
}
