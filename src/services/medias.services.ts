import { UPLOAD_DIR } from '@/constants/dir.js'
import { handleUploadImage } from '@/utils/file.js'
import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import fs from 'fs'
import { isProduction } from '@/constants/config.js'
import { envConfig } from '@/config/env.js'
import { MediaType } from '@/constants/enums.js'
import { Media } from '@/models/Other.js'
class MediasServices {
  async handleUploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const outputFilename = `${path.parse(file.newFilename).name}.jpg`
        const outputPath = path.resolve(UPLOAD_DIR, outputFilename)

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
}

const mediasServices = new MediasServices()
export default mediasServices
