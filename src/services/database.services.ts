import { Collection, Db, MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import User from '@/models/schemas/User.schema.js'
import RefreshToken from '@/models/schemas/RefreshToken.schema.js'
dotenv.config()
const encodedPassword = encodeURIComponent(process.env.DB_PASSWORD || '')
const username = process.env.DB_USERNAME

const uri = `mongodb://${username}:${encodedPassword}@ac-uezpzsf-shard-00-00.nuux7o4.mongodb.net:27017,ac-uezpzsf-shard-00-01.nuux7o4.mongodb.net:27017,ac-uezpzsf-shard-00-02.nuux7o4.mongodb.net:27017/?ssl=true&replicaSet=atlas-q9urq6-shard-0&authSource=admin&appName=Twitter`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    await this.client.connect()
    await this.db.command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  }

  async close() {
    await this.client.close()
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.USERS_COLLECTION as string)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.REFRESH_TOKENS_COLLECTION as string)
  }
}

const databaseService = new DatabaseService()

export default databaseService
