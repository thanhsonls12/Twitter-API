import { ObjectId } from 'mongodb'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import httpStatus from '@/constants/httpStatus.js'
import { TWEETS_MESSAGES } from '@/constants/messages.js'
import { ErrorWithStatus } from '@/models/Errors.js'
import databaseService from '@/services/database.services.js'
import tweetService from '@/services/tweets.services.js'

describe('tweet service deletion authorization', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('allows the tweet owner to delete it', async () => {
    const userId = new ObjectId()
    const tweetId = new ObjectId()
    const deleteOne = vi
      .fn()
      .mockResolvedValue({ acknowledged: true, deletedCount: 1 })
    vi.spyOn(databaseService, 'tweets', 'get').mockReturnValue({
      findOne: vi.fn().mockResolvedValue({ _id: tweetId, user_id: userId }),
      deleteOne
    } as never)

    const result = await tweetService.deleteTweet(
      tweetId.toString(),
      userId.toString()
    )

    expect(result.deletedCount).toBe(1)
    expect(deleteOne).toHaveBeenCalledWith({
      _id: tweetId,
      user_id: userId
    })
  })

  it('rejects deletion by a user who does not own the tweet', async () => {
    const ownerId = new ObjectId()
    const requesterId = new ObjectId()
    const tweetId = new ObjectId()
    const deleteOne = vi.fn()
    vi.spyOn(databaseService, 'tweets', 'get').mockReturnValue({
      findOne: vi.fn().mockResolvedValue({ _id: tweetId, user_id: ownerId }),
      deleteOne
    } as never)

    await expect(
      tweetService.deleteTweet(tweetId.toString(), requesterId.toString())
    ).rejects.toMatchObject<Partial<ErrorWithStatus>>({
      status: httpStatus.FORBIDDEN,
      message: TWEETS_MESSAGES.TWEET_DELETE_FORBIDDEN
    })
    expect(deleteOne).not.toHaveBeenCalled()
  })

  it('returns 404 when the tweet does not exist', async () => {
    const deleteOne = vi.fn()
    vi.spyOn(databaseService, 'tweets', 'get').mockReturnValue({
      findOne: vi.fn().mockResolvedValue(null),
      deleteOne
    } as never)

    await expect(
      tweetService.deleteTweet(
        new ObjectId().toString(),
        new ObjectId().toString()
      )
    ).rejects.toMatchObject<Partial<ErrorWithStatus>>({
      status: httpStatus.NOT_FOUND,
      message: TWEETS_MESSAGES.TWEET_NOT_FOUND
    })
    expect(deleteOne).not.toHaveBeenCalled()
  })
})
