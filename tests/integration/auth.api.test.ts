import express from 'express'
import request from 'supertest'
import { ObjectId } from 'mongodb'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import usersRouter from '@/routes/users.routes.js'
import { defaultErrorHandler } from '@/middlewares/error.middlewares.js'
import { AUTH_MESSAGES, USERS_MESSAGES } from '@/constants/messages.js'
import usersService from '@/services/users.services.js'
import databaseService from '@/services/database.services.js'
import { signToken } from '@/utils/jwt.js'
import { envConfig } from '@/config/env.js'
import { TokenType, UserVerifyStatus } from '@/constants/enums.js'

const createApp = () => {
  const app = express()
  app.use(express.json())
  app.use('/users', usersRouter)
  app.use(defaultErrorHandler)
  return app
}

describe('auth API integration', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('POST /users/register validates request body', async () => {
    const register = vi.spyOn(usersService, 'register')
    vi.spyOn(usersService, 'checkEmailExists').mockResolvedValue(false)

    const response = await request(createApp()).post('/users/register').send({
      name: '',
      email: 'not-an-email',
      password: 'weak',
      confirm_password: 'different'
    })

    expect(response.status).toBe(422)
    expect(response.body.message).toBe(USERS_MESSAGES.VALIDATION_ERROR)
    expect(response.body.errors).toMatchObject({
      name: expect.any(Object),
      email: expect.any(Object),
      password: expect.any(Object),
      confirm_password: expect.any(Object)
    })
    expect(register).not.toHaveBeenCalled()
  })

  it('POST /users/login returns 401 for an unknown account', async () => {
    vi.spyOn(databaseService, 'users', 'get').mockReturnValue({
      findOne: vi.fn().mockResolvedValue(null)
    } as never)

    const response = await request(createApp()).post('/users/login').send({
      email: 'missing@example.com',
      password: 'Password1!'
    })

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      message: AUTH_MESSAGES.INVALID_EMAIL_OR_PASSWORD
    })
  })

  it('GET /users/me authenticates a valid access token', async () => {
    const userId = new ObjectId().toString()
    const profile = { _id: userId, name: 'Son' }
    const getMe = vi.spyOn(usersService, 'getMe').mockResolvedValue(profile as never)
    const token = await signToken({
      payload: {
        user_id: userId,
        token_type: TokenType.AccessToken,
        verify: UserVerifyStatus.Verified
      },
      secretKey: envConfig.JWT_SECRET_ACCESS_TOKEN
    })

    const response = await request(createApp())
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      message: USERS_MESSAGES.USER_FETCHED_SUCCESSFULLY,
      data: profile
    })
    expect(getMe).toHaveBeenCalledWith(userId)
  })

  it('GET /users/me rejects a missing access token', async () => {
    const response = await request(createApp()).get('/users/me')

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      message: AUTH_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
    })
  })

  it('POST /users/refresh-token rotates a valid refresh token', async () => {
    const userId = new ObjectId().toString()
    const oldRefreshToken = await signToken({
      payload: {
        user_id: userId,
        token_type: TokenType.RefreshToken,
        verify: UserVerifyStatus.Verified
      },
      secretKey: envConfig.JWT_SECRET_REFRESH_TOKEN,
      options: { expiresIn: '7d' }
    })
    vi.spyOn(databaseService, 'refreshTokens', 'get').mockReturnValue({
      findOne: vi.fn().mockResolvedValue({
        user_id: new ObjectId(userId),
        token: oldRefreshToken
      })
    } as never)
    const refreshTokens = vi.spyOn(usersService, 'refreshTokens').mockResolvedValue({
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token'
    })

    const response = await request(createApp())
      .post('/users/refresh-token')
      .send({ refresh_token: oldRefreshToken })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      message: AUTH_MESSAGES.TOKENS_REFRESHED_SUCCESSFULLY,
      data: {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token'
      }
    })
    expect(refreshTokens).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: userId,
        refresh_token: oldRefreshToken
      })
    )
  })

  it('POST /users/logout invalidates a valid refresh token', async () => {
    const userId = new ObjectId().toString()
    const [accessToken, refreshToken] = await Promise.all([
      signToken({
        payload: {
          user_id: userId,
          token_type: TokenType.AccessToken,
          verify: UserVerifyStatus.Verified
        },
        secretKey: envConfig.JWT_SECRET_ACCESS_TOKEN
      }),
      signToken({
        payload: {
          user_id: userId,
          token_type: TokenType.RefreshToken,
          verify: UserVerifyStatus.Verified
        },
        secretKey: envConfig.JWT_SECRET_REFRESH_TOKEN,
        options: { expiresIn: '7d' }
      })
    ])
    vi.spyOn(databaseService, 'refreshTokens', 'get').mockReturnValue({
      findOne: vi.fn().mockResolvedValue({
        user_id: new ObjectId(userId),
        token: refreshToken
      })
    } as never)
    const logout = vi
      .spyOn(usersService, 'logout')
      .mockResolvedValue({ message: AUTH_MESSAGES.LOGOUT_SUCCESSFUL })

    const response = await request(createApp())
      .post('/users/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refresh_token: refreshToken })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ message: AUTH_MESSAGES.LOGOUT_SUCCESSFUL })
    expect(logout).toHaveBeenCalledWith(refreshToken, userId)
  })

  it('POST /users/refresh-token rejects a token removed by logout', async () => {
    const userId = new ObjectId().toString()
    const refreshToken = await signToken({
      payload: {
        user_id: userId,
        token_type: TokenType.RefreshToken,
        verify: UserVerifyStatus.Verified
      },
      secretKey: envConfig.JWT_SECRET_REFRESH_TOKEN,
      options: { expiresIn: '7d' }
    })
    vi.spyOn(databaseService, 'refreshTokens', 'get').mockReturnValue({
      findOne: vi.fn().mockResolvedValue(null)
    } as never)

    const response = await request(createApp())
      .post('/users/refresh-token')
      .send({ refresh_token: refreshToken })

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      message: AUTH_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXISTS
    })
  })
})
