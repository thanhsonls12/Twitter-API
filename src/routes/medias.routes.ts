import { uploadImageController } from '@/controllers/medias.controllers.js'
import { wrapRequestHandler } from '@/utils/handler.js'
import express from 'express'

const mediasRouter = express.Router()

mediasRouter.post('/upload-image', wrapRequestHandler(uploadImageController))

export default mediasRouter
