import { Collection, Db, MongoClient } from 'mongodb'
import { envConfig } from '@/config/env.js'
import User from '@/models/schemas/User.schema.js'
import RefreshToken from '@/models/schemas/RefreshToken.schema.js'
import Follow from '@/models/schemas/Follow.schema.js'
import VideoStatus from '@/models/schemas/VideoStatus.schema.js'
import Tweet from '@/models/schemas/Tweet.schema.js'
import Hashtag from '@/models/schemas/Hashtag.schema.js'
import { Bookmark } from '@/models/schemas/Bookmark.schema.js'
import { Like } from '@/models/schemas/Like.schema.js'

const uri = envConfig.MONGO_URI

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(envConfig.DB_NAME)
  }

  async connect() {
    await this.client.connect()
    await this.db.command({ ping: 1 })

    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  }

  async createIndexes() {
    const existsUsers = await this.users.indexExists(['email_1', 'username_1'])
    const existsRefreshTokens = await this.refreshTokens.indexExists([
      'token_1',
      'created_at_1'
    ])
    const existsFollows = await this.follows.indexExists([
      'follower_id_1_following_id_1'
    ])
    const existsVideoStatus = await this.videoStatus.indexExists(['name_1'])
    const existsHashtags = await this.hashtags.indexExists(['name_1'])
    const existsBookmarks = await this.bookmarks.indexExists([
      'user_id_1_tweet_id_1'
    ])
    const existsLikes = await this.likes.indexExists(['user_id_1_tweet_id_1'])
    if (
      existsUsers &&
      existsRefreshTokens &&
      existsFollows &&
      existsVideoStatus &&
      existsHashtags &&
      existsBookmarks &&
      existsLikes
    ) {
      return
    }

    await Promise.all([
      this.users.createIndex({ email: 1 }, { unique: true }),
      this.users.createIndex(
        { username: 1 },
        {
          unique: true,
          partialFilterExpression: { username: { $gt: '' } }
        }
      ),
      this.refreshTokens.createIndex({ token: 1 }, { unique: true }),
      this.refreshTokens.createIndex(
        { created_at: 1 },
        { expireAfterSeconds: envConfig.EXPIRE_AFTER_SECONDS }
      ),
      this.follows.createIndex(
        { follower_id: 1, following_id: 1 },
        { unique: true }
      ),
      this.videoStatus.createIndex({ name: 1 }, { unique: true }),
      this.hashtags.createIndex({ name: 1 }, { unique: true }),
      this.bookmarks.createIndex({ user_id: 1, tweet_id: 1 }, { unique: true }),
      this.likes.createIndex({ user_id: 1, tweet_id: 1 }, { unique: true })
    ])
  }

  async close() {
    await this.client.close()
  }

  get users(): Collection<User> {
    return this.db.collection(envConfig.USERS_COLLECTION)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(envConfig.REFRESH_TOKENS_COLLECTION)
  }

  get follows(): Collection<Follow> {
    return this.db.collection(envConfig.FOLLOWS_COLLECTION)
  }

  get videoStatus(): Collection<VideoStatus> {
    return this.db.collection(envConfig.VIDEO_STATUS_COLLECTION)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(envConfig.TWEETS_COLLECTION)
  }

  get hashtags(): Collection<Hashtag> {
    return this.db.collection(envConfig.HASHTAGS_COLLECTION)
  }

  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(envConfig.BOOKMARKS_COLLECTION)
  }

  get likes(): Collection<Like> {
    return this.db.collection(envConfig.LIKES_COLLECTION)
  }
}

const databaseService = new DatabaseService()

export default databaseService
