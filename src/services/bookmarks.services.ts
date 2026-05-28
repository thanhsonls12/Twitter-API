import { ObjectId } from 'mongodb'
import databaseService from './database.services.js'
import { ErrorWithStatus } from '@/models/Errors.js'
import { BOOKMARKS_MESSAGES } from '@/constants/messages.js'

class BookmarkService {
  async bookmarkTweet(user_id: string, tweet_id: string) {
    const result = await databaseService.bookmarks.findOneAndUpdate(
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

  async unbookmarkTweet(user_id: string, tweet_id: string) {
    const bookmark = await databaseService.bookmarks.findOne({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    if (!bookmark) {
      throw new ErrorWithStatus({
        message: BOOKMARKS_MESSAGES.BOOKMARK_NOT_FOUND,
        status: 404
      })
    }
    const result = await databaseService.bookmarks.deleteOne({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    return result
  }
}

const bookmarkService = new BookmarkService()

export default bookmarkService
