import { TweetRequestBody } from '@/models/requests/Tweet.requests.js'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
export const createTweetController = async (
  req: Request<ParamsDictionary, any, TweetRequestBody>,
  res: Response
) => {
  return res.status(201).json({ message: 'Tweet created successfully' })
}
