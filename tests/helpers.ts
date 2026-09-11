import type { Request, Response } from 'express'
import { vi } from 'vitest'

export const createMockResponse = () => {
  const response = {
    status: vi.fn(),
    json: vi.fn(),
    redirect: vi.fn()
  }
  response.status.mockReturnValue(response)
  response.json.mockReturnValue(response)
  response.redirect.mockReturnValue(response)
  return response as unknown as Response & {
    status: ReturnType<typeof vi.fn>
    json: ReturnType<typeof vi.fn>
  }
}

export const asRequest = (request: Partial<Request>) => request as Request
