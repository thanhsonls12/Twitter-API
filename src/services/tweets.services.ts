import { TweetRequestBody } from '@/models/requests/Tweet.requests.js'
import databaseService from './database.services.js'
import Tweet from '@/models/schemas/Tweet.schema.js'
import { ObjectId } from 'mongodb'
import Hashtag from '@/models/schemas/Hashtag.schema.js'
import { TWEETS_MESSAGES } from '@/constants/messages.js'
import { ErrorWithStatus } from '@/models/Errors.js'
import httpStatus from '@/constants/httpStatus.js'

class TweetService {
  async checkAndCreateHashtags(hashtags: string[]) {
    const result = await Promise.all(
      hashtags.map((name) =>
        databaseService.hashtags.findOneAndUpdate(
          { name },
          {
            $setOnInsert: new Hashtag({ name })
          },
          {
            upsert: true,
            returnDocument: 'after'
          }
        )
      )
    )

    return result.map((hashtag) => hashtag?._id as ObjectId)
  }
  async createTweet(body: TweetRequestBody, user_id: string) {
    const hashtagIds = await this.checkAndCreateHashtags(body.hashtags ?? [])
    const result = await databaseService.tweets.insertOne(
      new Tweet({
        user_id: new ObjectId(user_id),
        type: body.type,
        audience: body.audience,
        content: body.content,
        hashtags: hashtagIds,
        mentions: body.mentions,
        medias: body.medias,
        parent_id: body.parent_id
      })
    )

    return result
  }

  async getTweet(tweet_id: string) {
    const tweet = await databaseService.tweets.findOne({
      _id: new ObjectId(tweet_id)
    })
    if (!tweet) {
      throw new ErrorWithStatus({
        message: TWEETS_MESSAGES.TWEET_NOT_FOUND,
        status: httpStatus.NOT_FOUND
      })
    }
    return tweet
  }

  async deleteTweet(tweet_id: string, user_id: string) {
    const tweet = await databaseService.tweets.findOne({
      _id: new ObjectId(tweet_id)
    })
    if (!tweet) {
      throw new ErrorWithStatus({
        message: TWEETS_MESSAGES.TWEET_NOT_FOUND,
        status: httpStatus.NOT_FOUND
      })
    }
    const result = await databaseService.tweets.deleteOne({
      _id: new ObjectId(tweet_id),
      user_id: new ObjectId(user_id)
    })
    return result
  }
}
const tweetService = new TweetService()
export default tweetService
