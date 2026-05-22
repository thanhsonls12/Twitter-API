import { serveImageController } from '@/controllers/medias.controllers.js'
import express from 'express'

const staticRouter = express.Router()

staticRouter.get('/images/:filename', serveImageController)

export default staticRouter
