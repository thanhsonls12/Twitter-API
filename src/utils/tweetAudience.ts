import { TweetAudience } from '@/constants/enums.js'
import httpStatus from '@/constants/httpStatus.js'
import { TWEETS_MESSAGES } from '@/constants/messages.js'
import { ErrorWithStatus } from '@/models/Errors.js'
import databaseService from '@/services/database.services.js'
import { ObjectId } from 'mongodb'

export async function assertCanAccessTweet(tweet_id: string, user_id?: string) {
  const tweet = await databaseService.tweets.findOne({
    _id: new ObjectId(tweet_id)
  })

  if (!tweet) {
    throw new ErrorWithStatus({
      message: TWEETS_MESSAGES.TWEET_NOT_FOUND,
      status: httpStatus.NOT_FOUND
    })
  }

  if (tweet.audience === TweetAudience.Everyone) {
    return tweet
  }

  if (!user_id) {
    throw new ErrorWithStatus({
      message: TWEETS_MESSAGES.IS_NOT_PUBLIC,
      status: httpStatus.FORBIDDEN
    })
  }

  const currentUserId = new ObjectId(user_id)

  if (tweet.user_id.equals(currentUserId)) {
    return tweet
  }

  const author = await databaseService.users.findOne(
    {
      _id: tweet.user_id
    },
    {
      projection: {
        twitter_circle: 1
      }
    }
  )

  const allowed = author?.twitter_circle.some((id) => id.equals(currentUserId))

  if (!allowed) {
    throw new ErrorWithStatus({
      message: TWEETS_MESSAGES.IS_NOT_PUBLIC,
      status: httpStatus.FORBIDDEN
    })
  }

  return tweet
}
