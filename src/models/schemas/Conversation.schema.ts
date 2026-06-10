import { ObjectId } from 'mongodb'

interface IConversation {
  _id?: ObjectId
  participants: ObjectId[]
  created_at?: Date
  updated_at?: Date
}

export default class Conversation {
  _id?: ObjectId
  participants: ObjectId[]
  created_at: Date
  updated_at: Date

  constructor(conversation: IConversation) {
    this._id = conversation._id
    this.participants = conversation.participants
    this.created_at = conversation.created_at || new Date()
    this.updated_at = conversation.updated_at || new Date()
  }
}
