import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { envConfig } from './env.js'
import usersService from '@/services/users.services.js'
passport.use(
  new GoogleStrategy(
    {
      clientID: envConfig.GOOGLE_CLIENT_ID,
      clientSecret: envConfig.GOOGLE_CLIENT_SECRET,
      callbackURL: envConfig.GOOGLE_CALLBACK_URL
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value
        if (!email) {
          return done(new Error('No email found in Google profile'))
        }
        const result = await usersService.oauthGoogle({
          email,
          name: profile.displayName || email,
          google_id: profile.id
        })
        return done(null, {
          ...result.user,
          access_token: result.access_token,
          refresh_token: result.refresh_token
        })
      } catch (error) {
        return done(error)
      }
    }
  )
)

export default passport
