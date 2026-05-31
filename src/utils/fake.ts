import { faker } from '@faker-js/faker'
import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType, UserVerifyStatus } from '@/constants/enums.js'
import User from '@/models/schemas/User.schema.js'
import Follow from '@/models/schemas/Follow.schema.js'
import Tweet from '@/models/schemas/Tweet.schema.js'
import databaseService from '@/services/database.services.js'
import { hashPassword } from '@/utils/crypto.js'

const PASSWORD = 'Abc123!@#'
const USER_COUNT = 10
const TWEETS_PER_USER = 2

const createFakeUser = async (): Promise<User> => {
  const user = new User({
    _id: new ObjectId(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: await hashPassword(PASSWORD),
    date_of_birth: faker.date.birthdate({ min: 18, max: 60, mode: 'age' }),
    username: faker.internet.username().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
    bio: faker.lorem.sentence(),
    location: faker.location.city(),
    website: faker.internet.url(),
    avatar: faker.image.avatar(),
    verify: UserVerifyStatus.Verified
  })
  return user
}

const createFakeTweet = (user_id: ObjectId): Tweet => {
  return new Tweet({
    user_id,
    type: TweetType.Tweet,
    audience: TweetAudience.Everyone,
    content: faker.lorem.sentence(),
    hashtags: [],
    mentions: [],
    medias: [],
    parent_id: null
  })
}

export const seedDatabase = async () => {
  // Tạo 10 users
  const users: User[] = await Promise.all(
    Array.from({ length: USER_COUNT }, () => createFakeUser())
  )

  await databaseService.users.insertMany(users)
  console.log(`Inserted ${USER_COUNT} users`)

  // Mỗi user tạo 2 tweets
  const tweets: Tweet[] = users.flatMap((user) =>
    Array.from({ length: TWEETS_PER_USER }, () => createFakeTweet(user._id as ObjectId))
  )

  await databaseService.tweets.insertMany(tweets)
  console.log(`Inserted ${users.length * TWEETS_PER_USER} tweets`)

  // User đầu tiên follow 9 user còn lại
  const firstUser = users[0]
  const follows: Follow[] = users.slice(1).map(
    (user) =>
      new Follow({
        _id: new ObjectId(),
        follower_id: firstUser._id as ObjectId,
        following_id: user._id as ObjectId,
        created_at: new Date()
      })
  )

  await databaseService.follows.insertMany(follows)
  console.log(`User "${firstUser.name}" followed ${follows.length} users`)

  console.log('Seed completed!')
}
