import User from '@/models/schemas/User.schema.js'
import { WithId } from 'mongodb'

declare global {
  namespace Express {
    interface Request {
      user?: WithId<User>
    }
  }
}

export {}
