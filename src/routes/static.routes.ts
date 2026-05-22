import {
  serveImageController,
  serveVideoController
} from '@/controllers/medias.controllers.js'
import express from 'express'

const staticRouter = express.Router()

staticRouter.get('/images/:filename', serveImageController)

staticRouter.get('/videos/:filename', serveVideoController)

export default staticRouter
