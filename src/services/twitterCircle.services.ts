import { ObjectId } from 'mongodb'
import databaseService from './database.services.js'
import { ErrorWithStatus } from '@/models/Errors.js'
import { TWITTER_CIRCLE_MESSAGES } from '@/constants/messages.js'
import httpStatus from '@/constants/httpStatus.js'

class TwitterCircleServices {
  async addToCircle(current_user_id: string, user_id: string) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id)
    })
    if (!user) {
      throw new ErrorWithStatus({
        message: TWITTER_CIRCLE_MESSAGES.USER_NOT_FOUND,
        status: httpStatus.NOT_FOUND
      })
    }
    const currentUser = await databaseService.users.findOne(
      {
        _id: new ObjectId(current_user_id)
      },
      {
        projection: {
          twitter_circle: 1
        }
      }
    )
    if (!currentUser) {
      throw new ErrorWithStatus({
        message: TWITTER_CIRCLE_MESSAGES.USER_NOT_FOUND,
        status: httpStatus.NOT_FOUND
      })
    }
    if (
      currentUser.twitter_circle &&
      currentUser.twitter_circle.length >= 150
    ) {
      throw new ErrorWithStatus({
        message: TWITTER_CIRCLE_MESSAGES.CIRCLE_LIMIT_REACHED,
        status: httpStatus.BAD_REQUEST
      })
    }
    const result = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(current_user_id)
      },
      {
        $addToSet: {
          twitter_circle: new ObjectId(user_id)
        }
      },
      {
        returnDocument: 'after',
        projection: { twitter_circle: 1 }
      }
    )
    return result
  }

  async removeFromCircle(current_user_id: string, user_id: string) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(user_id)
    })
    if (!user) {
      throw new ErrorWithStatus({
        message: TWITTER_CIRCLE_MESSAGES.USER_NOT_FOUND,
        status: httpStatus.NOT_FOUND
      })
    }
    const currentUser = await databaseService.users.findOne(
      {
        _id: new ObjectId(current_user_id)
      },
      {
        projection: {
          twitter_circle: 1
        }
      }
    )
    if (!currentUser) {
      throw new ErrorWithStatus({
        message: TWITTER_CIRCLE_MESSAGES.USER_NOT_FOUND,
        status: httpStatus.NOT_FOUND
      })
    }
    const result = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(current_user_id)
      },
      {
        $pull: {
          twitter_circle: new ObjectId(user_id)
        }
      },
      {
        projection: { twitter_circle: 1 },
        returnDocument: 'after'
      }
    )
    return result
  }
}

const twitterCircleServices = new TwitterCircleServices()

export default twitterCircleServices
