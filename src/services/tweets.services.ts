import { TweetRequestBody } from '@/models/requests/Tweet.requests.js'
import databaseService from './database.services.js'
import Tweet from '@/models/schemas/Tweet.schema.js'
import { ObjectId } from 'mongodb'
import Hashtag from '@/models/schemas/Hashtag.schema.js'
import { TWEETS_MESSAGES } from '@/constants/messages.js'
import { ErrorWithStatus } from '@/models/Errors.js'
import httpStatus from '@/constants/httpStatus.js'
import { TweetAudience } from '@/constants/enums.js'
import { envConfig } from '@/config/env.js'
import {
  authorLookupStages,
  commonTweetAggregationStages
} from '@/utils/aggregation.helpers.js'

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
        ...commonTweetAggregationStages()
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
      {
        $inc: user_id ? { user_views: 1 } : { guest_views: 1 },
        $set: { updated_at: new Date() }
      }
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
    if (!tweet.user_id.equals(new ObjectId(user_id))) {
      throw new ErrorWithStatus({
        message: TWEETS_MESSAGES.TWEET_DELETE_FORBIDDEN,
        status: httpStatus.FORBIDDEN
      })
    }
    const result = await databaseService.tweets.deleteOne({
      _id: new ObjectId(tweet_id),
      user_id: new ObjectId(user_id)
    })
    return result
  }

  async getTweetChildren(
    tweet_id: string,
    type?: number,
    page: number = 1,
    limit: number = 20,
    user_id?: string
  ) {
    const matchStage: any = {
      parent_id: new ObjectId(tweet_id),
      audience: TweetAudience.Everyone
    }
    if (type !== undefined) {
      matchStage.type = type
    }
    const skip = (page - 1) * limit

    const children = await databaseService.tweets
      .aggregate([
        { $match: matchStage },
        { $sort: { _id: -1 } },
        { $skip: skip },
        { $limit: limit },
        ...authorLookupStages(),
        ...commonTweetAggregationStages()
      ])
      .toArray()

    const [, total] = await Promise.all([
      databaseService.tweets.updateMany(matchStage, {
        $inc: user_id ? { user_views: 1 } : { guest_views: 1 }
      }),
      databaseService.tweets.countDocuments(matchStage)
    ])

    const total_pages = Math.ceil(total / limit)

    children.forEach((child) => {
      child.user_views += user_id ? 1 : 0
      child.guest_views += user_id ? 0 : 1
    })

    return {
      children,
      pagination: {
        page,
        limit,
        total,
        total_pages
      }
    }
  }

  async getNewFeeds(user_id: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit
    const followedUsers = await databaseService.follows
      .find(
        {
          follower_id: new ObjectId(user_id)
        },
        {
          projection: { following_id: 1 }
        }
      )
      .toArray()

    const followingIds = followedUsers.map((follow) => follow.following_id)

    const matchStage = {
      user_id: { $in: followingIds },
      $or: [
        { audience: TweetAudience.Everyone },
        {
          $and: [
            { audience: TweetAudience.TwitterCircle },
            { 'author.twitter_circle': new ObjectId(user_id) }
          ]
        }
      ]
    }
    const [result] = await databaseService.tweets
      .aggregate([
        {
          $lookup: {
            from: envConfig.USERS_COLLECTION,
            localField: 'user_id',
            foreignField: '_id',
            as: 'author'
          }
        },
        { $unwind: '$author' },
        { $match: matchStage },
        { $sort: { created_at: -1 } },
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [
              { $skip: skip },
              { $limit: limit },
              {
                $project: {
                  'author.password': 0,
                  'author.email_verify_token': 0,
                  'author.forgot_password_token': 0,
                  'author.twitter_circle': 0
                }
              },
              ...commonTweetAggregationStages()
            ]
          }
        }
      ])
      .toArray()
    const total = result.metadata[0]?.total ?? 0
    const tweets = result.data
    const tweetIds = tweets.map((tweet: any) => tweet._id)
    await databaseService.tweets.updateMany(
      {
        _id: { $in: tweetIds }
      },
      {
        $inc: { user_views: 1 }
      }
    )

    tweets.forEach((tweet: any) => {
      tweet.user_views += 1
    })

    return {
      tweets,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    }
  }
}
const tweetService = new TweetService()
export default tweetService
