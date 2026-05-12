import { ObjectId } from 'mongodb'

interface IFollow {
  _id: ObjectId
  follower_id: ObjectId
  following_id: ObjectId
  created_at: Date
}

export default class Follow {
  _id: ObjectId
  follower_id: ObjectId
  following_id: ObjectId
  created_at: Date

  constructor(follow: IFollow) {
    this._id = follow._id
    this.follower_id = follow.follower_id
    this.following_id = follow.following_id
    this.created_at = follow.created_at
  }
}
