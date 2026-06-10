import { TokenPayload } from '@/@types/express.js'
import { SOCKET_MESSAGES } from '@/constants/messages.js'
import conversationService from '@/services/conversations.services.js'
import { ObjectId } from 'mongodb'
import { Server, Socket } from 'socket.io'

export function registerChatHandlers(
  io: Server,
  socket: Socket,
  users: Map<string, string>
) {
  const { user_id } = socket.data.user as TokenPayload

  socket.on(
    'chat:send_message',
    async (data: { conversation_id?: string; content?: string }) => {
      try {
        const { conversation_id, content } = data

        if (
          typeof conversation_id !== 'string' ||
          !ObjectId.isValid(conversation_id) ||
          typeof content !== 'string' ||
          !content.trim()
        ) {
          socket.emit('chat:error', {
            message: SOCKET_MESSAGES.INVALID_PAYLOAD
          })
          return
        }

        // Persist the message before notifying clients.
        const message = await conversationService.sendMessage(
          conversation_id,
          user_id,
          content.trim()
        )

        const receiver_id =
          await conversationService.getReceiverIdFromConversation(
            conversation_id,
            user_id
          )

        const payload = { conversation_id, message }

        socket.emit('chat:new_message', payload)

        if (receiver_id) {
          const receiverSocketId = users.get(receiver_id)
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('chat:new_message', payload)
          }
        }
      } catch {
        socket.emit('chat:error', {
          message: SOCKET_MESSAGES.SEND_MESSAGE_FAILED
        })
      }
    }
  )

  socket.on('chat:typing', async (data: { conversation_id?: string }) => {
    try {
      const { conversation_id } = data

      if (
        typeof conversation_id !== 'string' ||
        !ObjectId.isValid(conversation_id)
      ) {
        socket.emit('chat:error', { message: SOCKET_MESSAGES.INVALID_PAYLOAD })
        return
      }

      const receiver_id =
        await conversationService.getReceiverIdFromConversation(
          conversation_id,
          user_id
        )

      if (!receiver_id) return

      const receiverSocketId = users.get(receiver_id)
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('chat:user_typing', {
          conversation_id,
          user_id
        })
      }
    } catch {
      socket.emit('chat:error', { message: SOCKET_MESSAGES.TYPING_FAILED })
    }
  })
}
