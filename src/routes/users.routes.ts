import {
  loginController,
  registerController
} from '@/controllers/users.controllers.js'
import {
  loginValidator,
  registerValidator
} from '@/middlewares/users.middlewares.js'
import { wrapRequestHandler } from '@/utils/handler.js'

import express, { Request, Response } from 'express'

const usersRouter = express.Router()

usersRouter.get('/tweets', (req: Request, res: Response) => {
  res.json({
    data: [
      {
        id: '1',
        text: 'Hello Twitter!'
      }
    ]
  })
})

usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

usersRouter.post(
  '/register',
  registerValidator,
  wrapRequestHandler(registerController)
)

export default usersRouter
