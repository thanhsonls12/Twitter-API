import { envConfig } from '@/config/env.js'
import { TweetType } from '@/constants/enums.js'
import { Document } from 'mongodb'

export const commonTweetAggregationStages = (): Document[] => [
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
      from: envConfig.LIKES_COLLECTION,
      localField: '_id',
      foreignField: 'tweet_id',
      as: 'likes'
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
      from: envConfig.TWEETS_COLLECTION,
      localField: '_id',
      foreignField: 'parent_id',
      as: 'tweet_children'
    }
  },
  {
    $addFields: {
      likes_count: { $size: '$likes' },
      bookmarks_count: { $size: '$bookmarks' },
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
      likes: 0,
      bookmarks: 0,
      tweet_children: 0
    }
  }
]

export const authorLookupStages = (): Document[] => [
  {
    $lookup: {
      from: envConfig.USERS_COLLECTION,
      localField: 'user_id',
      foreignField: '_id',
      as: 'author'
    }
  },
  {
    $unwind: '$author'
  },
  {
    $project: {
      'author.password': 0,
      'author.email': 0,
      'author.email_verify_token': 0,
      'author.forgot_password_token': 0,
      'author.twitter_circle': 0
    }
  }
]
