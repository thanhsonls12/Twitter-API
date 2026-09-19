import databaseService from '@/services/database.services.js'
import { ObjectId } from 'mongodb'
import { Request, Response } from 'express'

export const getTrendingHashtagsController = async (
  req: Request,
  res: Response
) => {
  const hashtags = await databaseService.hashtags
    .aggregate([
      {
        $lookup: {
          from: 'tweets',
          localField: '_id',
          foreignField: 'hashtags',
          as: 'tweets'
        }
      },
      {
        $addFields: {
          tweet_count: { $size: '$tweets' }
        }
      },
      {
        $project: {
          name: 1,
          tweet_count: 1
        }
      },
      {
        $sort: { tweet_count: -1 }
      },
      {
        $limit: 10
      }
    ])
    .toArray()

  return res.json({
    message: 'Get trending hashtags successfully',
    data: {
      hashtags
    }
  })
}

export const getSuggestedUsersController = async (
  req: Request,
  res: Response
) => {
  const userId = (req as any).decoded_authorization?.userId

  // Get users that current user is not following
  const followingIds = userId
    ? await databaseService.follows
        .find({ follower_id: new ObjectId(userId) })
        .project({ following_id: 1 })
        .toArray()
        .then((follows) => follows.map((follow) => follow.following_id))
    : []

  const excludeIds = userId
    ? [new ObjectId(userId), ...followingIds]
    : followingIds

  const users = await databaseService.users
    .aggregate([
      {
        $match: {
          _id: { $nin: excludeIds }
        }
      },
      {
        $lookup: {
          from: 'follows',
          localField: '_id',
          foreignField: 'following_id',
          as: 'followers'
        }
      },
      {
        $addFields: {
          follower_count: { $size: '$followers' }
        }
      },
      {
        $sort: { follower_count: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          name: 1,
          username: 1,
          avatar: 1,
          bio: 1,
          follower_count: 1
        }
      }
    ])
    .toArray()

  return res.json({
    message: 'Get suggested users successfully',
    data: {
      users
    }
  })
}
