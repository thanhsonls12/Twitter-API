import { ObjectId } from 'mongodb'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loginController, registerController } from '@/controllers/users.controllers.js'
import { UserVerifyStatus } from '@/constants/enums.js'
import { AUTH_MESSAGES } from '@/constants/messages.js'
import usersService from '@/services/users.services.js'
import { asRequest, createMockResponse } from '../helpers.js'

describe('auth controllers', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('register returns 201 and tokens from the service', async () => {
    const tokens = { access_token: 'access', refresh_token: 'refresh' }
    const register = vi.spyOn(usersService, 'register').mockResolvedValue(tokens)
    const body = {
      name: 'Son',
      email: 'son@example.com',
      password: 'Password1!',
      confirm_password: 'Password1!',
      date_of_birth: new Date('2000-01-01')
    }
    const req = asRequest({ body })
    const res = createMockResponse()

    await registerController(req as never, res)

    expect(register).toHaveBeenCalledWith(body)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({
      message: AUTH_MESSAGES.USER_REGISTERED_SUCCESSFULLY,
      data: tokens
    })
  })

  it('login returns the user id and generated tokens', async () => {
    const userId = new ObjectId()
    const login = vi.spyOn(usersService, 'login').mockResolvedValue({
      access_token: 'access',
      refresh_token: 'refresh'
    })
    const req = asRequest({
      user: { _id: userId, verify: UserVerifyStatus.Verified } as never,
      body: { email: 'son@example.com', password: 'Password1!' }
    })
    const res = createMockResponse()

    await loginController(req as never, res)

    expect(login).toHaveBeenCalledWith({
      user_id: userId.toString(),
      verify: UserVerifyStatus.Verified
    })
    expect(res.json).toHaveBeenCalledWith({
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
      data: {
        user_id: userId.toString(),
        access_token: 'access',
        refresh_token: 'refresh'
      }
    })
  })
})
