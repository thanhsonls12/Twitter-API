import { RegisterRequestBody } from '@/models/requests/User.requests.js'
import usersService from '@/services/users.services.js'
import { AUTH_MESSAGES } from '@/constants/messages.js'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterRequestBody>,
  res: Response
) => {
  const result = await usersService.register(req.body)
  return res.status(201).json({
    message: AUTH_MESSAGES.USER_REGISTERED_SUCCESSFULLY,
    data: result
  })
}

export const loginController = async (req: Request, res: Response) => {
  const user = req.user
  if (!user || !user._id) {
    return res.status(401).json({
      message: AUTH_MESSAGES.INVALID_EMAIL_OR_PASSWORD
    })
  }
  const user_id = user._id.toString()
  const { access_token, refresh_token } = await usersService.login(user_id)
  return res.json({
    message: AUTH_MESSAGES.LOGIN_SUCCESS,
    data: {
      user_id,
      access_token,
      refresh_token
    }
  })
}

export const logoutController = async (req: Request, res: Response) => {
  const { refresh_token } = req.body
  const user_id = req.decoded_authorization?.user_id
  const result = await usersService.logout(refresh_token, user_id as string)
  return res.json(result)
}
