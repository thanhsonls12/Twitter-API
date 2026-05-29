import { TokenPayload } from '@/@types/express.js'
import httpStatus from '@/constants/httpStatus.js'
import { TWITTER_CIRCLE_MESSAGES } from '@/constants/messages.js'
import twitterCircleServices from '@/services/twitterCircle.services.js'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

export const addToCircleController = async (
  req: Request<ParamsDictionary, any, { user_id: string }>,
  res: Response
) => {
  const { user_id: current_user_id } = req.decoded_authorization as TokenPayload
  const { user_id } = req.body
  const result = await twitterCircleServices.addToCircle(
    current_user_id,
    user_id
  )
  return res
    .status(httpStatus.OK)
    .json({ message: TWITTER_CIRCLE_MESSAGES.USER_ADDED_TO_CIRCLE, result })
}

export const removeFromCircleController = async (
  req: Request<ParamsDictionary, any, { user_id: string }>,
  res: Response
) => {
  const { user_id: current_user_id } = req.decoded_authorization as TokenPayload
  const { user_id } = req.params
  const result = await twitterCircleServices.removeFromCircle(
    current_user_id,
    user_id as string
  )
  return res
    .status(httpStatus.OK)
    .json({ message: TWITTER_CIRCLE_MESSAGES.USER_REMOVED_FROM_CIRCLE, result })
}
