import { TweetAudience, TweetType } from '@/constants/enums.js'
import { Media } from '../Other.js'

export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id?: string | null
  hashtags?: string[]
  mentions?: string[]
  medias?: Media[]
}
