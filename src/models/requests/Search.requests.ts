import { MediaType } from '@/constants/enums.js'

export interface SearchUsersQuery {
  q: string
  page?: number
  limit?: number
}

export interface SearchTweetsQuery {
  q: string
  page?: number
  limit?: number
  media_type?: MediaType
  people_follow?: number
}
