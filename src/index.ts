/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { NextFunction, Request, Response } from 'express'
import usersRouter from './routes/users.routes.js'
import databaseService from './services/database.services.js'
import httpStatus from './constants/httpStatus.js'
import { defaultErrorHandler } from './middlewares/error.middlewares.js'
const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

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
