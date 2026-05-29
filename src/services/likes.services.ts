import { ObjectId } from 'mongodb'
import databaseService from './database.services.js'
import { ErrorWithStatus } from '@/models/Errors.js'
import { LIKES_MESSAGES } from '@/constants/messages.js'
import httpStatus from '@/constants/httpStatus.js'

class LikesService {
  async likeTweet(user_id: string, tweet_id: string) {
    const result = await databaseService.likes.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: {
          user_id: new ObjectId(user_id),
          tweet_id: new ObjectId(tweet_id),
          created_at: new Date()
        }
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return result
  }

  async unlikeTweet(user_id: string, tweet_id: string) {
    const like = await databaseService.likes.findOne({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    if (!like) {
      throw new ErrorWithStatus({
        message: LIKES_MESSAGES.LIKE_NOT_FOUND,
        status: httpStatus.NOT_FOUND
      })
    }
    const result = await databaseService.likes.deleteOne({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    return result
  }

  async getTweetLikes(user_id: string) {
    const result = await databaseService.likes.find({
      user_id: new ObjectId(user_id)
    }).toArray()
    return result
  }
}

const likesService = new LikesService()

export default likesService
