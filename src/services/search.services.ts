import { TweetAudience } from '@/constants/enums.js'
import databaseService from './database.services.js'
import {
  authorLookupStages,
  commonTweetAggregationStages
} from '@/utils/aggregation.helpers.js'
import { ObjectId } from 'mongodb'
import { envConfig } from '@/config/env.js'

class SearchServices {
  async searchUsers(q: string, page: number, limit: number) {
    const skip = (page - 1) * limit
    const users = await databaseService.users
      .find(
        {
          $text: { $search: q }
        },
        {
          projection: {
            password: 0,
            email_verify_token: 0,
            forgot_password_token: 0,
            twitter_circle: 0,
            email: 0,
            score: { $meta: 'textScore' }
          }
        }
      )
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await databaseService.users.countDocuments({
      $text: { $search: q }
    })

    const userWithoutScore = users.map((user: any) => {
      const sanitizedUser = { ...user }
      delete sanitizedUser.score
      return sanitizedUser
    })

    return {
      data: userWithoutScore,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit)
      }
    }
  }

  async searchTweets(
    q: string,
    page: number,
    limit: number,
    user_id?: string,
    media_type?: number,
    people_follow?: number
  ) {
    const skip = (page - 1) * limit
    const mediaFilter =
      media_type !== undefined ? { 'medias.type': media_type } : {}
    const followingIds: ObjectId[] = []
    if (people_follow === 1 && user_id) {
      const follows = await databaseService.follows
        .find({
          follower_id: new ObjectId(user_id)
        })
        .project({ following_id: 1 })
        .toArray()
      followingIds.push(...follows.map((follow) => follow.following_id))
      followingIds.push(new ObjectId(user_id))
    }
    const pipeline = user_id
      ? [
          { $match: { $text: { $search: q }, ...mediaFilter } },
          { $addFields: { score: { $meta: 'textScore' } } },
          { $sort: { score: -1 } },
          {
            $lookup: {
              from: envConfig.USERS_COLLECTION,
              localField: 'user_id',
              foreignField: '_id',
              as: 'author'
            }
          },
          { $unwind: '$author' },
          ...(followingIds.length > 0
            ? [
                {
                  $match: {
                    user_id: { $in: followingIds }
                  }
                }
              ]
            : []),
          {
            $match: {
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
          },
          {
            $facet: {
              metadata: [{ $count: 'total' }],
              data: [
                { $skip: skip },
                { $limit: limit },
                {
                  $project: {
                    score: 0,
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
        ]
      : [
          {
            $match: {
              $text: { $search: q },
              ...mediaFilter,
              audience: TweetAudience.Everyone
            }
          },
          ...(followingIds.length > 0
            ? [{ $match: { user_id: { $in: followingIds } } }]
            : []),
          { $addFields: { score: { $meta: 'textScore' } } },
          { $sort: { score: -1 } },
          {
            $facet: {
              metadata: [{ $count: 'total' }],
              data: [
                { $skip: skip },
                { $limit: limit },
                ...authorLookupStages(),
                { $project: { score: 0 } },
                ...commonTweetAggregationStages()
              ]
            }
          }
        ]

    const [result] = await databaseService.tweets.aggregate(pipeline).toArray()
    const total = result.metadata[0]?.total ?? 0
    return {
      tweets: result.data,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit)
      }
    }
  }
}

const searchServices = new SearchServices()

export default searchServices
