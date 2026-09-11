import { describe, expect, it, vi } from 'vitest'
import { createTweetController, getTweetController } from '@/controllers/tweets.controllers.js'
import { TweetAudience, TweetType } from '@/constants/enums.js'
import { TWEETS_MESSAGES } from '@/constants/messages.js'
import tweetService from '@/services/tweets.services.js'
import { asRequest, createMockResponse } from '../helpers.js'

describe('tweet controllers', () => {
  it('create tweet passes body and authenticated user to the service', async () => {
    const body = {
      type: TweetType.Tweet,
      audience: TweetAudience.Everyone,
      content: 'Hello!',
      parent_id: null,
      hashtags: [],
      mentions: [],
      medias: []
    }
    const tweet = { _id: 'tweet-id', ...body }
    const createTweet = vi
      .spyOn(tweetService, 'createTweet')
      .mockResolvedValue(tweet as never)
    const req = asRequest({ body })
    req.decoded_authorization = { user_id: 'user-id' } as never
    const res = createMockResponse()

    await createTweetController(req as never, res)

    expect(createTweet).toHaveBeenCalledWith(body, 'user-id')
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({
      message: TWEETS_MESSAGES.TWEET_CREATED,
      data: { tweet }
    })
  })

  it('get tweet supports an anonymous request', async () => {
    const result = { _id: 'tweet-id', content: 'Public tweet' }
    const getTweet = vi
      .spyOn(tweetService, 'getTweet')
      .mockResolvedValue(result as never)
    const req = asRequest({ params: { tweet_id: 'tweet-id' } })
    const res = createMockResponse()

    await getTweetController(req, res)

    expect(getTweet).toHaveBeenCalledWith('tweet-id', undefined)
    expect(res.json).toHaveBeenCalledWith({
      message: TWEETS_MESSAGES.TWEET_FETCHED,
      result
    })
  })
})
