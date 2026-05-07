import { createHash } from 'crypto'
import 'dotenv/config'
function sha256(data: string) {
  return createHash('sha256').update(data).digest('hex')
}

export function hashPassword(password: string) {
  return sha256(password + process.env.PASSWORD_SECRET)
}
