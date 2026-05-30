import { TweetRequestBody } from '@/models/requests/Tweet.requests.js'
import databaseService from './database.services.js'
import Tweet from '@/models/schemas/Tweet.schema.js'
import { ObjectId } from 'mongodb'
import Hashtag from '@/models/schemas/Hashtag.schema.js'
import { TWEETS_MESSAGES } from '@/constants/messages.js'
import { ErrorWithStatus } from '@/models/Errors.js'
import httpStatus from '@/constants/httpStatus.js'
import { TweetType } from '@/constants/enums.js'
import { envConfig } from '@/config/env.js'

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

  async getTweet(tweet_id: string, user_id?: string) {
    const [tweet] = await databaseService.tweets
      .aggregate([
        {
          $match: {
            _id: new ObjectId(tweet_id)
          }
        },
        {
          $lookup: {
            from: envConfig.HASHTAGS_COLLECTION,
            localField: 'hashtags',
            foreignField: '_id',
            as: 'hashtags'
          }
        },
        {
          $lookup: {
            from: envConfig.USERS_COLLECTION,
            localField: 'mentions',
            foreignField: '_id',
            as: 'mentions'
          }
        },
        {
          $addFields: {
            mentions: {
              $map: {
                input: '$mentions',
                as: 'mention',
                in: {
                  _id: '$$mention._id',
                  name: '$$mention.name',
                  username: '$$mention.username',
                  avatar: '$$mention.avatar'
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: envConfig.BOOKMARKS_COLLECTION,
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'bookmarks'
          }
        },
        {
          $lookup: {
            from: envConfig.LIKES_COLLECTION,
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'likes'
          }
        },
        {
          $lookup: {
            from: envConfig.TWEETS_COLLECTION,
            localField: '_id',
            foreignField: 'parent_id',
            as: 'tweet_children'
          }
        },
        {
          $addFields: {
            bookmarks_count: { $size: '$bookmarks' },
            likes_count: { $size: '$likes' },
            retweet_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: { $eq: ['$$item.type', TweetType.Retweet] }
                }
              }
            },
            comment_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: { $eq: ['$$item.type', TweetType.Comment] }
                }
              }
            },
            quote_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: { $eq: ['$$item.type', TweetType.QuoteTweet] }
                }
              }
            }
          }
        },
        {
          $project: {
            bookmarks: 0,
            likes: 0,
            tweet_children: 0
          }
        }
      ])
      .toArray()
    if (!tweet) {
      throw new ErrorWithStatus({
        message: TWEETS_MESSAGES.TWEET_NOT_FOUND,
        status: httpStatus.NOT_FOUND
      })
    }

    await databaseService.tweets.updateOne(
      { _id: new ObjectId(tweet_id) },
      { $inc: user_id ? { user_views: 1 } : { guest_views: 1 } }
    )

    tweet.user_views += user_id ? 1 : 0
    tweet.guest_views += user_id ? 0 : 1
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
