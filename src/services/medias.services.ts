import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '@/constants/dir.js'
import { handleUploadImage, handleUploadVideo } from '@/utils/file.js'
import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import fs from 'fs'
import { fileTypeFromFile } from 'file-type'
import { envConfig } from '@/config/env.js'
import { EncodingStatus, MediaType } from '@/constants/enums.js'
import { Media } from '@/models/Other.js'
import { ErrorWithStatus } from '@/models/Errors.js'
import httpStatus from '@/constants/httpStatus.js'
import { MEDIAS_MESSAGES } from '@/constants/messages.js'
import { encodeHLSWithMultipleVideoStreams } from '@/utils/video.js'
import databaseService from './database.services.js'
import VideoStatus from '@/models/schemas/VideoStatus.schema.js'
import {
  uploadFolderToSupabase,
  uploadToSupabase
} from '@/utils/supabaseStorage.js'

const allowedVideoMimes = ['video/mp4', 'video/webm', 'video/quicktime']

class Queue {
  items: {
    videoPath: string
    fileName: string
  }[]
  encoding: boolean
  constructor() {
    this.items = []
    this.encoding = false
  }
  async enqueue(item: { videoPath: string; fileName: string }) {
    this.items.push(item)
    const idName = path.parse(item.fileName).name
    await databaseService.videoStatus.insertOne(
      new VideoStatus({
        name: idName,
        status: EncodingStatus.Pending
      })
    )
    this.processEncode()
  }
  async processEncode() {
    if (this.encoding) return
    if (this.items.length > 0) {
      this.encoding = true
      const videoPath = this.items[0].videoPath
      const idName = path.parse(this.items[0].fileName).name
      await databaseService.videoStatus.updateOne(
        { name: idName },
        {
          $set: { status: EncodingStatus.Processing },
          $currentDate: { updated_at: true }
        }
      )
      try {
        await encodeHLSWithMultipleVideoStreams(videoPath)
        const hlsFolder = path.resolve(UPLOAD_VIDEO_DIR, idName)
        await uploadFolderToSupabase({
          bucket: 'videos',
          folderPath: hlsFolder,
          remotePrefix: idName
        })
        fs.promises.unlink(videoPath)
        fs.promises.rm(hlsFolder, { recursive: true, force: true })
        this.items.shift()
        fs.promises.unlink(videoPath)
        await databaseService.videoStatus.updateOne(
          { name: idName },
          {
            $set: { status: EncodingStatus.Success },
            $currentDate: { updated_at: true }
          }
        )
      } catch (error) {
        console.error(`Error encoding ${videoPath}:`, error)
        await databaseService.videoStatus
          .updateOne(
            { name: idName },
            {
              $set: { status: EncodingStatus.Failed },
              $currentDate: { updated_at: true }
            }
          )
          .catch((err) => {
            console.error(`Error updating video status for ${idName}:`, err)
          })
      } finally {
        this.items.shift()
        this.encoding = false
        this.processEncode()
      }
    } else {
      console.log('No videos to encode')
    }
  }
}

const queue = new Queue()

class MediasServices {
  async handleUploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const outputFilename = `${path.parse(file.newFilename).name}.jpg`
        const outputPath = path.resolve(UPLOAD_IMAGE_DIR, outputFilename)

        await sharp(file.filepath).jpeg().toFile(outputPath)
        fs.unlinkSync(file.filepath)

        const url = await uploadToSupabase({
          bucket: 'images',
          filePath: outputPath,
          fileName: outputFilename
        })

        fs.unlinkSync(outputPath)

        return {
          url,
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

        if (!fileType || !allowedVideoMimes.includes(fileType.mime)) {
          fs.unlinkSync(file.filepath)
          throw new ErrorWithStatus({
            message: MEDIAS_MESSAGES.INVALID_VIDEO_FILE_TYPE,
            status: httpStatus.BAD_REQUEST
          })
        }

        const url = await uploadToSupabase({
          bucket: 'videos',
          filePath: file.filepath,
          fileName: file.newFilename
        })

        fs.unlinkSync(file.filepath)

        return {
          url,
          type: MediaType.Video
        }
      })
    )

    return result
  }

  async handleUploadVideoHLS(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const idName = path.parse(file.newFilename).name
        queue.enqueue({ videoPath: file.filepath, fileName: file.newFilename })
        return {
          url: `${envConfig.SUPABASE_URL}/storage/v1/object/public/videos/${idName}/master.m3u8`,
          type: MediaType.VideoHLS
        }
      })
    )
    return result
  }

  async getVideoStatus(id: string) {
    const videoStatus = await databaseService.videoStatus.findOne({ name: id })
    if (!videoStatus) {
      throw new ErrorWithStatus({
        message: MEDIAS_MESSAGES.VIDEO_STATUS_NOT_FOUND,
        status: httpStatus.NOT_FOUND
      })
    }
    return videoStatus
  }
}

const mediasServices = new MediasServices()
export default mediasServices
