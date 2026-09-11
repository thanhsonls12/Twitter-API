import express from 'express'
import request from 'supertest'
import { ObjectId } from 'mongodb'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import tweetsRouter from '@/routes/tweets.routes.js'
import { defaultErrorHandler } from '@/middlewares/error.middlewares.js'
import { AUTH_MESSAGES, TWEETS_MESSAGES } from '@/constants/messages.js'
import databaseService from '@/services/database.services.js'
import tweetService from '@/services/tweets.services.js'
import { signToken } from '@/utils/jwt.js'
import { envConfig } from '@/config/env.js'
import { TokenType, TweetAudience, TweetType, UserVerifyStatus } from '@/constants/enums.js'

const createApp = () => {
  const app = express()
  app.use(express.json())
  app.use('/tweets', tweetsRouter)
  app.use(defaultErrorHandler)
  return app
}

const authenticatedUser = async () => {
  const userId = new ObjectId().toString()
  const token = await signToken({
    payload: {
      user_id: userId,
      token_type: TokenType.AccessToken,
      verify: UserVerifyStatus.Verified
    },
    secretKey: envConfig.JWT_SECRET_ACCESS_TOKEN
  })
  return { userId, token }
}

describe('tweet API integration', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('POST /tweets creates a tweet for a verified user', async () => {
    const { userId, token } = await authenticatedUser()
    vi.spyOn(databaseService, 'users', 'get').mockReturnValue({
      findOne: vi.fn().mockResolvedValue({
        _id: new ObjectId(userId),
        verify: UserVerifyStatus.Verified
      })
    } as never)
    const body = {
      type: TweetType.Tweet,
      audience: TweetAudience.Everyone,
      content: 'Integration test tweet',
      parent_id: null,
      hashtags: [],
      mentions: [],
      medias: []
    }
    const createdTweet = { _id: new ObjectId().toString(), ...body }
    const createTweet = vi
      .spyOn(tweetService, 'createTweet')
      .mockResolvedValue(createdTweet as never)

    const response = await request(createApp())
      .post('/tweets')
      .set('Authorization', `Bearer ${token}`)
      .send(body)

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      message: TWEETS_MESSAGES.TWEET_CREATED,
      data: { tweet: createdTweet }
    })
    expect(createTweet).toHaveBeenCalledWith(body, userId)
  })

  it('POST /tweets rejects unauthenticated requests', async () => {
    const response = await request(createApp()).post('/tweets').send({
      type: TweetType.Tweet,
      audience: TweetAudience.Everyone,
      content: 'No token'
    })

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      message: AUTH_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
    })
  })

  it('POST /tweets rejects an empty original tweet', async () => {
    const { userId, token } = await authenticatedUser()
    vi.spyOn(databaseService, 'users', 'get').mockReturnValue({
      findOne: vi.fn().mockResolvedValue({
        _id: new ObjectId(userId),
        verify: UserVerifyStatus.Verified
      })
    } as never)
    const createTweet = vi.spyOn(tweetService, 'createTweet')

    const response = await request(createApp())
      .post('/tweets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: TweetType.Tweet,
        audience: TweetAudience.Everyone,
        content: '',
        parent_id: null,
        hashtags: [],
        mentions: [],
        medias: []
      })

    expect(response.status).toBe(422)
    expect(response.body.errors.content.msg).toBe(
      TWEETS_MESSAGES.CONTENT_OR_MEDIA_REQUIRED
    )
    expect(createTweet).not.toHaveBeenCalled()
  })

  it('GET /tweets/:tweet_id rejects an invalid id before querying MongoDB', async () => {
    const findTweet = vi.fn()
    vi.spyOn(databaseService, 'tweets', 'get').mockReturnValue({
      findOne: findTweet
    } as never)

    const response = await request(createApp()).get('/tweets/not-an-object-id')

    expect(response.status).toBe(422)
    expect(response.body.errors.tweet_id.msg).toBe(
      TWEETS_MESSAGES.TWEET_ID_INVALID
    )
    expect(findTweet).not.toHaveBeenCalled()
  })
})
