/* eslint-disable @typescript-eslint/no-unused-vars */
import '@/config/env.js'
import { envConfig } from '@/config/env.js'
import express, { NextFunction, Request, Response } from 'express'
import usersRouter from './routes/users.routes.js'
import databaseService from './services/database.services.js'
import httpStatus from './constants/httpStatus.js'
import { defaultErrorHandler } from './middlewares/error.middlewares.js'
import helmet from 'helmet'
const app = express()
const port = Number(envConfig.PORT)
app.use(helmet())
app.use(express.json({ limit: '10kb' }))

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!')
})

app.use('/users', usersRouter)

async function startServer() {
  try {
    await databaseService.connect()
    app.use(defaultErrorHandler)
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`)
    })
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    process.exit(1)
  }
}

startServer()
