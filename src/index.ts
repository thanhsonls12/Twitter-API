import '@/config/env.js'
import { envConfig } from '@/config/env.js'
import express from 'express'
import usersRouter from './routes/users.routes.js'
import databaseService from './services/database.services.js'
import { defaultErrorHandler } from './middlewares/error.middlewares.js'
import helmet from 'helmet'
import passport from '@/config/passport.js'
import mediasRouter from './routes/medias.routes.js'
import { initFolder } from './utils/file.js'

import staticRouter from './routes/static.routes.js'
import tweetsRouter from './routes/tweets.routes.js'
import bookmarksRouter from './routes/bookmarks.routes.js'
import likesRouter from './routes/likes.routes.js'
import twitterCircleRouter from './routes/twitterCircle.routes.js'
import searchRouter from './routes/search.routes.js'
import discoverRouter from './routes/discover.routes.js'
import http from 'http'
import { initSocket } from './socket/index.js'
import conversationsRouter from './routes/conversations.routes.js'
import { setupSwagger } from './config/swagger.js'
import cors from 'cors'
const app = express()
const server = http.createServer(app)
const port = Number(envConfig.PORT)

if (envConfig.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
}

setupSwagger(app)
app.use(helmet())
app.use(
  cors({
    origin:
      envConfig.CORS_ORIGINS.length > 0 ? envConfig.CORS_ORIGINS : false,
    credentials: true
  })
)
app.use(express.json({ limit: '10kb' }))

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime())
  })
})

app.get('/health/ready', async (_req, res) => {
  try {
    await databaseService.ping()
    res.json({ status: 'ready' })
  } catch {
    res.status(503).json({ status: 'not_ready' })
  }
})

initFolder()

app.use(passport.initialize())

app.use(staticRouter)
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarksRouter)
app.use('/likes', likesRouter)
app.use('/twitter-circle', twitterCircleRouter)
app.use('/search', searchRouter)
app.use('/discover', discoverRouter)
app.use('/conversations', conversationsRouter)

app.use(defaultErrorHandler)

let isShuttingDown = false

async function startServer() {
  try {
    await databaseService.connect().then(() => databaseService.createIndexes())
    const io = initSocket(server)

    server.listen(port, () => {
      console.log(`Server is running on port ${port}`)
    })

    const shutdown = async (signal: NodeJS.Signals) => {
      if (isShuttingDown) return
      isShuttingDown = true

      console.log(`Received ${signal}. Shutting down gracefully...`)
      io.disconnectSockets(true)

      const forceExitTimer = setTimeout(() => {
        console.error('Graceful shutdown timed out. Forcing exit.')
        process.exit(1)
      }, 10_000)
      forceExitTimer.unref()

      try {
        await new Promise<void>((resolve, reject) => {
          server.close((error) => {
            if (error) {
              reject(error)
              return
            }
            resolve()
          })
        })
        await databaseService.close()
        clearTimeout(forceExitTimer)
        process.exit(0)
      } catch (error) {
        console.error('Error during graceful shutdown:', error)
        process.exit(1)
      }
    }

    process.once('SIGTERM', () => void shutdown('SIGTERM'))
    process.once('SIGINT', () => void shutdown('SIGINT'))
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    process.exit(1)
  }
}

startServer()
