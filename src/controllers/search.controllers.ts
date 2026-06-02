import httpStatus from '@/constants/httpStatus.js'
import { SEARCH_MESSAGES } from '@/constants/messages.js'
import searchServices from '@/services/search.services.js'
import { Request, Response } from 'express'

export const searchUsersController = async (req: Request, res: Response) => {
  const q = req.query.q as string
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 20
  const result = await searchServices.searchUsers(q, page, limit)
  return res.status(httpStatus.OK).json({
    message: SEARCH_MESSAGES.USERS_FETCHED_SUCCESSFULLY,
    result
  })
}

export const searchTweetsController = async (req: Request, res: Response) => {
  const q = req.query.q as string
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 20
  const user_id = req.decoded_authorization?.user_id
  const media_type =
    req.query.media_type !== undefined
      ? Number(req.query.media_type)
      : undefined
  const people_follow =
    req.query.people_follow !== undefined
      ? Number(req.query.people_follow)
      : undefined
  const result = await searchServices.searchTweets(
    q,
    page,
    limit,
    user_id,
    media_type,
    people_follow
  )
  return res.status(httpStatus.OK).json({
    message: SEARCH_MESSAGES.TWEETS_FETCHED_SUCCESSFULLY,
    result
  })
}
