import { TokenPayload } from '@/@types/express.js'
import httpStatus from '@/constants/httpStatus.js'
import { TWEETS_MESSAGES } from '@/constants/messages.js'
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
    .json({ message: TWEETS_MESSAGES.TWEET_CREATED, result })
}

export const getTweetController = async (req: Request, res: Response) => {
  const { tweet_id } = req.params
  const user_id = (req.decoded_authorization as TokenPayload | undefined)
    ?.user_id
  const result = await tweetService.getTweet(tweet_id as string, user_id)
  return res
    .status(httpStatus.OK)
    .json({ message: TWEETS_MESSAGES.TWEET_FETCHED, result })
}

export const deleteTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.params
  const result = await tweetService.deleteTweet(tweet_id as string, user_id)
  return res
    .status(httpStatus.OK)
    .json({ message: TWEETS_MESSAGES.TWEET_DELETED, result })
}

export const getTweetChildrenController = async (
  req: Request,
  res: Response
) => {
  const { tweet_id } = req.params
  const user_id = req.decoded_authorization?.user_id
  const type = req.query.type ? Number(req.query.type) : undefined
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 20
  const result = await tweetService.getTweetChildren(
    tweet_id as string,
    type,
    page,
    limit,
    user_id
  )
  return res
    .status(httpStatus.OK)
    .json({ message: TWEETS_MESSAGES.TWEET_CHILDREN_FETCHED, result })
}

export const getNewFeedsController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 20
  const result = await tweetService.getNewFeeds(user_id, page, limit)
  return res
    .status(httpStatus.OK)
    .json({ message: TWEETS_MESSAGES.NEW_FEEDS_FETCHED, result })
}
