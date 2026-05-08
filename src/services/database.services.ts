import { Collection, Db, MongoClient } from 'mongodb'
import { envConfig } from '@/config/env.js'
import User from '@/models/schemas/User.schema.js'
import RefreshToken from '@/models/schemas/RefreshToken.schema.js'

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
    await this.createIndexes()
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  }

  async createIndexes() {
    await Promise.all([
      this.users.createIndex({ email: 1 }, { unique: true }),
      this.refreshTokens.createIndex(
        { created_at: 1 },
        { expireAfterSeconds: envConfig.EXPIRE_AFTER_SECONDS }
      )
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
}

const databaseService = new DatabaseService()

export default databaseService
