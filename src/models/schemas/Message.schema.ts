import { ObjectId } from 'mongodb'

interface IMessage {
  _id?: ObjectId
  conversation_id: ObjectId
  sender_id: ObjectId
  content: string
  created_at?: Date
}

export default class Message {
  _id?: ObjectId
  conversation_id: ObjectId
  sender_id: ObjectId
  content: string
  created_at: Date

  constructor(message: IMessage) {
    this._id = message._id || new ObjectId()
    this.conversation_id = message.conversation_id
    this.sender_id = message.sender_id
    this.content = message.content
    this.created_at = message.created_at || new Date()
  }
}
