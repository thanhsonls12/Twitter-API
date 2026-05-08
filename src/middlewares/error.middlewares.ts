/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from '@/constants/httpStatus.js'
import { ErrorWithStatus } from '@/models/Errors.js'
import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash-es'
import { envConfig } from '@/config/env.js'
export const defaultErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json(omit(err, ['status', 'stack']))
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
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errorInfo: omit(err, ['stack'])
  })
}
