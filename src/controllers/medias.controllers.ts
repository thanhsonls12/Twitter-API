import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '@/constants/dir.js'
import httpStatus from '@/constants/httpStatus.js'
import mediasServices from '@/services/medias.services.js'

import { Request, Response } from 'express'
import path from 'path'
import fs from 'fs'
import mime from 'mime-types'
import { MEDIAS_MESSAGES } from '@/constants/messages.js'
export const uploadImageController = async (req: Request, res: Response) => {
  const result = await mediasServices.handleUploadImage(req)
  return res.json({
    message: 'Image uploaded successfully',
    result
  })
}

export const serveImageController = (req: Request, res: Response) => {
  const { filename } = req.params
  return res.sendFile(
    path.resolve(UPLOAD_IMAGE_DIR, filename as string),
    (err) => {
      if (err) {
        console.error('Error sending file:', err)
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ message: 'Image not found' })
      }
    }
  )
}

export const uploadVideoController = async (req: Request, res: Response) => {
  const result = await mediasServices.handleUploadVideo(req)
  return res.json({
    message: 'Video uploaded successfully',
    result
  })
}

export const serveVideoController = (req: Request, res: Response) => {
  const { range } = req.headers
  if (!range) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: 'Range header is required' })
  }
  const { filename } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, filename as string)
  const videoSize = fs.statSync(videoPath).size
  const CHUNK_SIZE = 10 ** 6 // 1MB
  const start = Number(range.replace(/\D/g, ''))
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1)
  const contentLength = end - start + 1
  const contentType = mime.lookup(videoPath) || 'video/*'
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(httpStatus.PARTIAL_CONTENT, headers)
  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)
}

export const uploadVideoHLSController = async (req: Request, res: Response) => {
  const result = await mediasServices.handleUploadVideoHLS(req)
  return res.json({
    message: MEDIAS_MESSAGES.VIDEO_UPLOADED_AND_QUEUED_FOR_HLS_CONVERSION,
    result
  })
}

export const videoStatusController = async (req: Request, res: Response) => {
  const { id } = req.params
  const videoStatus = await mediasServices.getVideoStatus(id as string)
  return res.json(videoStatus)
}
