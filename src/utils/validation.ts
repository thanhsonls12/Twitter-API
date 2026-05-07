import httpStatus from '@/constants/httpStatus.js'
import { EntityError, ErrorWithStatus } from '@/models/Errors.js'
import { Request, Response, NextFunction } from 'express'
import { validationResult, ContextRunner } from 'express-validator'

export const validate = (validations: ContextRunner | ContextRunner[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const runners = Array.isArray(validations) ? validations : [validations]
    await Promise.all(runners.map((validation) => validation.run(req)))
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }
    const errorsObject = errors.mapped()
    const entityErrors = new EntityError({ errors: {} })
    for (const key in errorsObject) {
      const { msg } = errorsObject[key]
      if (
        msg instanceof ErrorWithStatus &&
        msg.status !== httpStatus.UNPROCESSABLE_ENTITY
      ) {
        return next(msg)
      }
      entityErrors.errors[key] = errorsObject[key]
    }
    next(entityErrors)
  }
}
