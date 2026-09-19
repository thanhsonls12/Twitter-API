import { TokenPayload } from '@/@types/express.js'
import { envConfig } from '@/config/env.js'
import { SOCKET_MESSAGES } from '@/constants/messages.js'
import { verifyToken } from '@/utils/jwt.js'
import { Server as HttpServer } from 'http'
import { Server } from 'socket.io'
import { registerChatHandlers } from './chat.handler.js'

const users = new Map<string, string>()

export function initSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin:
        envConfig.CORS_ORIGINS.length > 0 ? envConfig.CORS_ORIGINS : false,
      credentials: true
    }
  })

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token as string
    if (!token) {
      return next(new Error(SOCKET_MESSAGES.TOKEN_REQUIRED))
    }
    try {
      const decoded = await verifyToken({
        token,
        secretKey: envConfig.JWT_SECRET_ACCESS_TOKEN
      })
      socket.data.user = decoded
      next()
    } catch {
      next(new Error(SOCKET_MESSAGES.TOKEN_INVALID))
    }
  })

  io.on('connection', (socket) => {
    const { user_id } = socket.data.user as TokenPayload
    console.log(
      `${SOCKET_MESSAGES.USER_CONNECTED}: ${user_id}, Socket ID: ${socket.id}`
    )

    users.set(user_id, socket.id)

    registerChatHandlers(io, socket, users)

    socket.on('disconnect', () => {
      console.log(
        `${SOCKET_MESSAGES.USER_DISCONNECTED}: ${user_id}, Socket ID: ${socket.id}`
      )
      users.delete(user_id)
    })
  })

  return io
}
