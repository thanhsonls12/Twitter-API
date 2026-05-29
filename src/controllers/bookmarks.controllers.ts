import { TokenPayload } from '@/@types/express.js'
import { BookmarkTweetRequest } from '@/models/requests/Bookmark.requests.js'
import bookmarkService from '@/services/bookmarks.services.js'
import { BOOKMARKS_MESSAGES } from '@/constants/messages.js'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import httpStatus from '@/constants/httpStatus.js'
export const getBookmarksController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await bookmarkService.getBookmarks(user_id)
  return res
    .status(httpStatus.OK)
    .json({ message: BOOKMARKS_MESSAGES.BOOKMARKS_FETCHED, result })
}

export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetRequest>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.body
  const result = await bookmarkService.bookmarkTweet(user_id, tweet_id)
  return res
    .status(httpStatus.CREATED)
    .json({ message: BOOKMARKS_MESSAGES.BOOKMARK_CREATED, result })
}

export const unbookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetRequest>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.params
  const result = await bookmarkService.unbookmarkTweet(
    user_id,
    tweet_id as string
  )
  return res
    .status(httpStatus.OK)
    .json({ message: BOOKMARKS_MESSAGES.BOOKMARK_DELETED, result })
}
