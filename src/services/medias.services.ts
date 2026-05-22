import { UPLOAD_IMAGE_DIR } from '@/constants/dir.js'
import { handleUploadImage, handleUploadVideo } from '@/utils/file.js'
import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import fs from 'fs'
import { fileTypeFromFile } from 'file-type'
import { isProduction } from '@/constants/config.js'
import { envConfig } from '@/config/env.js'
import { MediaType } from '@/constants/enums.js'
import { Media } from '@/models/Other.js'
import { ErrorWithStatus } from '@/models/Errors.js'
import httpStatus from '@/constants/httpStatus.js'
import { MEDIAS_MESSAGES } from '@/constants/messages.js'

const allowedVideoMimes = ['video/mp4', 'video/webm', 'video/quicktime']

class MediasServices {
  async handleUploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const outputFilename = `${path.parse(file.newFilename).name}.jpg`
        const outputPath = path.resolve(UPLOAD_IMAGE_DIR, outputFilename)

        await sharp(file.filepath).jpeg().toFile(outputPath)
        fs.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${envConfig.BASE_URL}/images/${outputFilename}`
            : `http://localhost:${envConfig.PORT}/images/${outputFilename}`,
          type: MediaType.Image
        }
      })
    )
    return result
  }

  async handleUploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const fileType = await fileTypeFromFile(file.filepath)
        console.log('fileType: ', fileType)
        if (!fileType || !allowedVideoMimes.includes(fileType.mime)) {
          fs.unlinkSync(file.filepath)
          throw new ErrorWithStatus({
            message: MEDIAS_MESSAGES.INVALID_VIDEO_FILE_TYPE,
            status: httpStatus.BAD_REQUEST
          })
        }

        return {
          url: isProduction
            ? `${envConfig.BASE_URL}/videos/${file.newFilename}`
            : `http://localhost:${envConfig.PORT}/videos/${file.newFilename}`,
          type: MediaType.Video
        }
      })
    )

    return result
  }
}

const mediasServices = new MediasServices()
export default mediasServices
