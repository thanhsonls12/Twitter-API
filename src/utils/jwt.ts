import jwt, { SignOptions } from 'jsonwebtoken'

import { AUTH_MESSAGES } from '@/constants/messages.js'
import { TokenPayload } from '@/@types/express.js'

export const signToken = ({
  payload,
  secretKey,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: string | Buffer | object
  secretKey: string
  options?: SignOptions
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secretKey, options, (err, token) => {
      if (err) {
        return reject(err)
      }
      if (!token) {
        return reject(new Error(AUTH_MESSAGES.JWT_TOKEN_GENERATION_FAILED))
      }
      resolve(token)
    })
  })
}

export const verifyToken = ({
  token,
  secretKey
}: {
  token: string
  secretKey: string
}) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return reject(err)
      }
      resolve(decoded as TokenPayload)
    })
  })
}
