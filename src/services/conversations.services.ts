import { ObjectId } from 'mongodb'
import databaseService from './database.services.js'
import Conversation from '@/models/schemas/Conversation.schema.js'
import Message from '@/models/schemas/Message.schema.js'
import { envConfig } from '@/config/env.js'
import { ErrorWithStatus } from '@/models/Errors.js'
import httpStatus from '@/constants/httpStatus.js'
import { CONVERSATIONS_MESSAGES } from '@/constants/messages.js'

class ConversationService {
  async createConversation(sender_id: string, receiver_id: string) {
    const senderObjectId = new ObjectId(sender_id)
    const receiverObjectId = new ObjectId(receiver_id)
    const participants = [senderObjectId, receiverObjectId].sort((a, b) =>
      a.toString().localeCompare(b.toString())
    )
    const result = await databaseService.conversations.findOneAndUpdate(
      {
        participants: {
          $all: participants
        }
      },
      {
        $setOnInsert: new Conversation({
          participants,
          created_at: new Date(),
          updated_at: new Date()
        })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return result
  }
  async getConversations(user_id: string) {
    const result = await databaseService.conversations
      .aggregate([
        {
          $match: {
            participants: new ObjectId(user_id)
          }
        },
        {
          $sort: {
            updated_at: -1
          }
        },
        {
          $lookup: {
            from: envConfig.USERS_COLLECTION,
            let: {
              participants: '$participants',
              current_user_id: new ObjectId(user_id)
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ['$_id', '$$participants'] },
                      { $ne: ['$_id', '$$current_user_id'] }
                    ]
                  }
                }
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  username: 1,
                  avatar: 1
                }
              }
            ],
            as: 'other_user'
          }
        },
        {
          $unwind: '$other_user'
        },
        {
          $lookup: {
            from: envConfig.MESSAGES_COLLECTION,
            let: {
              conversation_id: '$_id'
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$conversation_id', '$$conversation_id']
                  }
                }
              },
              {
                $sort: {
                  created_at: -1
                }
              },
              {
                $limit: 1
              }
            ],
            as: 'last_message'
          }
        },
        {
          $unwind: {
            path: '$last_message',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            other_user: 1,
            last_message: 1,
            updated_at: 1
          }
        }
      ])
      .toArray()

    return result
  }

  async sendMessage(
    conversation_id: string,
    sender_id: string,
    content: string
  ) {
    const conversationObjectId = new ObjectId(conversation_id)
    const senderObjectId = new ObjectId(sender_id)
    const conversation = await databaseService.conversations.findOne({
      _id: conversationObjectId,
      participants: senderObjectId
    })

    if (!conversation) {
      throw new ErrorWithStatus({
        message: CONVERSATIONS_MESSAGES.CONVERSATION_NOT_FOUND,
        status: httpStatus.NOT_FOUND
      })
    }

    const message = new Message({
      conversation_id: conversationObjectId,
      sender_id: senderObjectId,
      content
    })

    // Keep the conversation list ordered by the latest message.
    const [insertResult] = await Promise.all([
      databaseService.messages.insertOne(message),
      databaseService.conversations.updateOne(
        { _id: conversationObjectId },
        { $set: { updated_at: new Date() } }
      )
    ])

    return {
      _id: insertResult.insertedId,
      conversation_id: message.conversation_id,
      sender_id: message.sender_id,
      content: message.content,
      created_at: message.created_at
    }
  }

  async getReceiverIdFromConversation(
    conversation_id: string,
    sender_id: string
  ) {
    const senderObjectId = new ObjectId(sender_id)
    const conversation = await databaseService.conversations.findOne({
      _id: new ObjectId(conversation_id),
      participants: senderObjectId
    })

    if (!conversation) return null

    const receiver = conversation.participants.find(
      (id) => id.toString() !== sender_id
    )

    return receiver?.toString() || null
  }

  async getMessages(conversation_id: string, limit: number, cursor?: string) {
    const match: Record<string, any> = {
      conversation_id: new ObjectId(conversation_id)
    }
    if (cursor) {
      match._id = { $lt: new ObjectId(cursor) }
    }

    const messages = await databaseService.messages
      .find(match)
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray()

    return messages
  }
}

const conversationService = new ConversationService()

export default conversationService
