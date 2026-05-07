import httpStatus from '@/constants/httpStatus.js'
import { USERS_MESSAGES } from '@/constants/messages.js'

type ErrorType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>

export class ErrorWithStatus {
  message: string
  status: number

  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

export class EntityError extends ErrorWithStatus {
  errors: ErrorType
  constructor({
    message = USERS_MESSAGES.VALIDATION_ERROR,
    errors
  }: {
    message?: string
    errors: ErrorType
  }) {
    super({ message, status: httpStatus.UNPROCESSABLE_ENTITY })
    this.errors = errors
  }
}
