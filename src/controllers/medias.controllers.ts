import { UPLOAD_DIR } from '@/constants/dir.js'
import httpStatus from '@/constants/httpStatus.js'
import mediasServices from '@/services/medias.services.js'

import { Request, Response } from 'express'
import path from 'path'

export const uploadImageController = async (req: Request, res: Response) => {
  const result = await mediasServices.handleUploadImage(req)
  return res.json({
    message: 'Image uploaded successfully',
    result
  })
}

export const serveImageController = (req: Request, res: Response) => {
  const { filename } = req.params
  return res.sendFile(path.resolve(UPLOAD_DIR, filename as string), (err) => {
    if (err) {
      console.error('Error sending file:', err)
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: 'Image not found' })
    }
  })
}
