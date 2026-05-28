import { TokenPayload } from '@/@types/express.js'
import { BookmarkTweetRequest } from '@/models/requests/Bookmark.requests.js'
import bookmarkService from '@/services/bookmarks.services.js'
import { BOOKMARKS_MESSAGES } from '@/constants/messages.js'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetRequest>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.body
  const result = await bookmarkService.bookmarkTweet(user_id, tweet_id)
  return res
    .status(201)
    .json({ message: BOOKMARKS_MESSAGES.BOOKMARK_CREATED, result })
}

export const unbookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkTweetRequest>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweetId } = req.params
  const result = await bookmarkService.unbookmarkTweet(
    user_id,
    tweetId as string
  )
  return res
    .status(200)
    .json({ message: BOOKMARKS_MESSAGES.BOOKMARK_DELETED, result })
}
