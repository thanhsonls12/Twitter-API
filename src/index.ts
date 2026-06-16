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
import http from 'http'
import { initSocket } from './socket/index.js'
import conversationsRouter from './routes/conversations.routes.js'
import { setupSwagger } from './config/swagger.js'
const app = express()
const server = http.createServer(app)
const port = Number(envConfig.PORT)
setupSwagger(app)
app.use(helmet())
app.use(express.json({ limit: '10kb' }))

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
app.use('/conversations', conversationsRouter)
async function startServer() {
  try {
    await databaseService.connect().then(() => databaseService.createIndexes())
    app.use(defaultErrorHandler)
    initSocket(server)

    server.listen(port, () => {
      console.log(`Server is running on port ${port}`)
    })
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    process.exit(1)
  }
}

startServer()
