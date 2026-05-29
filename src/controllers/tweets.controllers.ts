import { TokenPayload } from '@/@types/express.js'
import httpStatus from '@/constants/httpStatus.js'
import { TweetRequestBody } from '@/models/requests/Tweet.requests.js'

import tweetService from '@/services/tweets.services.js'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
export const createTweetController = async (
  req: Request<ParamsDictionary, any, TweetRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetService.createTweet(req.body, user_id)
  return res
    .status(httpStatus.CREATED)
    .json({ message: 'Tweet created successfully', result })
}
