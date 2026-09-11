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

  it('GET /tweets/:tweet_id allows anonymous access to a public tweet', async () => {
    const tweetId = new ObjectId()
    const publicTweet = {
      _id: tweetId,
      user_id: new ObjectId(),
      audience: TweetAudience.Everyone,
      content: 'Public tweet'
    }
    vi.spyOn(databaseService, 'tweets', 'get').mockReturnValue({
      findOne: vi.fn().mockResolvedValue(publicTweet)
    } as never)
    vi.spyOn(tweetService, 'getTweet').mockResolvedValue(publicTweet as never)

    const response = await request(createApp()).get(`/tweets/${tweetId}`)

    expect(response.status).toBe(200)
    expect(response.body.result).toMatchObject({
      _id: tweetId.toString(),
      content: 'Public tweet'
    })
    expect(tweetService.getTweet).toHaveBeenCalledWith(
      tweetId.toString(),
      undefined
    )
  })

  it('GET /tweets/:tweet_id allows a Twitter Circle member', async () => {
    const { userId, token } = await authenticatedUser()
    const tweetId = new ObjectId()
    const authorId = new ObjectId()
    const privateTweet = {
      _id: tweetId,
      user_id: authorId,
      audience: TweetAudience.TwitterCircle,
      content: 'Circle tweet'
    }
    vi.spyOn(databaseService, 'tweets', 'get').mockReturnValue({
      findOne: vi.fn().mockResolvedValue(privateTweet)
    } as never)
    vi.spyOn(databaseService, 'users', 'get').mockReturnValue({
      findOne: vi
        .fn()
        .mockResolvedValueOnce({ verify: UserVerifyStatus.Verified })
        .mockResolvedValueOnce({ twitter_circle: [new ObjectId(userId)] })
    } as never)
    vi.spyOn(tweetService, 'getTweet').mockResolvedValue(privateTweet as never)

    const response = await request(createApp())
      .get(`/tweets/${tweetId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.result.content).toBe('Circle tweet')
  })

  it('GET /tweets/:tweet_id rejects a user outside the Twitter Circle', async () => {
    const { token } = await authenticatedUser()
    const tweetId = new ObjectId()
    vi.spyOn(databaseService, 'tweets', 'get').mockReturnValue({
      findOne: vi.fn().mockResolvedValue({
        _id: tweetId,
        user_id: new ObjectId(),
        audience: TweetAudience.TwitterCircle
      })
    } as never)
    vi.spyOn(databaseService, 'users', 'get').mockReturnValue({
      findOne: vi
        .fn()
        .mockResolvedValueOnce({ verify: UserVerifyStatus.Verified })
        .mockResolvedValueOnce({ twitter_circle: [] })
    } as never)
    const getTweet = vi.spyOn(tweetService, 'getTweet')

    const response = await request(createApp())
      .get(`/tweets/${tweetId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(403)
    expect(response.body).toEqual({ message: TWEETS_MESSAGES.IS_NOT_PUBLIC })
    expect(getTweet).not.toHaveBeenCalled()
  })

  it('GET /tweets/:tweet_id requires login for a Twitter Circle tweet', async () => {
    const tweetId = new ObjectId()
    vi.spyOn(databaseService, 'tweets', 'get').mockReturnValue({
      findOne: vi.fn().mockResolvedValue({
        _id: tweetId,
        user_id: new ObjectId(),
        audience: TweetAudience.TwitterCircle
      })
    } as never)

    const response = await request(createApp()).get(`/tweets/${tweetId}`)

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      message: AUTH_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
    })
  })
})
