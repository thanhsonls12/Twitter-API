import { UPLOAD_VIDEO_DIR } from '@/constants/dir.js'
import {
  serveImageController,
  serveVideoController
} from '@/controllers/medias.controllers.js'
import express from 'express'
import path from 'path'

const staticRouter = express.Router()

staticRouter.get('/images/:filename', serveImageController)

staticRouter.use(
  '/videos',
  express.static(path.resolve(UPLOAD_VIDEO_DIR), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.m3u8')) {
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl')
      }
      if (filePath.endsWith('.ts')) {
        res.setHeader('Content-Type', 'video/mp2t')
      }
    }
  })
)

staticRouter.get('/videos/:filename', serveVideoController)

export default staticRouter
