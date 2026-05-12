/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from '@/constants/httpStatus.js'
import { EntityError, ErrorWithStatus } from '@/models/Errors.js'
import { NextFunction, Request, Response } from 'express'
import { envConfig } from '@/config/env.js'
export const defaultErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json({
      message: err.message,
      ...(err instanceof EntityError && { errors: err.errors })
    })
  }

  if (envConfig.NODE_ENV === 'production') {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error'
    })
  }

  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, {
      enumerable: true
    })
  })
  const { stack: _stack, ...errorInfo } = err
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errorInfo
  })
}
