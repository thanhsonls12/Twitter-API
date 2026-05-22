import { ErrorWithStatus } from '@/models/Errors.js'
import httpStatus from '@/constants/httpStatus.js'

export class UploadValidationError extends ErrorWithStatus {
  constructor(message: string, reason?: string) {
    super({
      message,
      status: httpStatus.BAD_REQUEST
    })
    this.reason = reason
  }

  reason?: string
}

export const UploadErrorReasons = {
  FILE_TYPE_INVALID: 'Invalid file type. Only images are allowed.',
  FILE_SIZE_TOO_LARGE: 'File size exceeds 300KB limit.',
  NO_FILE_PROVIDED: 'No image file provided.',
  TOO_MANY_FILES: 'Maximum 4 files allowed per upload.',
  MAGIC_BYTES_INVALID: 'File content does not match image type.',
  FILE_PARSING_FAILED: 'Failed to parse uploaded file.',
  REQUEST_TIMEOUT: 'Upload request timed out.'
}
