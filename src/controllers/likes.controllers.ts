import { TokenPayload } from '@/@types/express.js'
import httpStatus from '@/constants/httpStatus.js'
import { LikeTweetRequestBody } from '@/models/requests/Like.requests.js'
import likesService from '@/services/likes.services.js'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
export const likeTweetController = async (
  req: Request<ParamsDictionary, any, LikeTweetRequestBody>,
  res: Response
) => {
  const { tweet_id } = req.body
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await likesService.likeTweet(user_id, tweet_id)
  return res
    .status(httpStatus.CREATED)
    .json({ message: 'Tweet liked successfully', result })
}

export const unlikeTweetController = async (
  req: Request<ParamsDictionary, any, LikeTweetRequestBody>,
  res: Response
) => {
  const { tweet_id } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await likesService.unlikeTweet(user_id, tweet_id as string)
  return res
    .status(httpStatus.OK)
    .json({ message: 'Tweet unliked successfully', result })
}
