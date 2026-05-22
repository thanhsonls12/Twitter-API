import {
  UPLOAD_IMAGE_DIR,
  UPLOAD_IMAGE_TEMP_DIR,
  UPLOAD_VIDEO_DIR
} from '@/constants/dir.js'
import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import path from 'path'
import { MEDIAS_MESSAGES } from '@/constants/messages.js'

export const initFolder = () => {
  ;[UPLOAD_IMAGE_DIR, UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR].forEach(
    (dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    }
  )
}

export const handleUploadImage = (req: Request) => {
  let uploadError: Error | null = null
  const form = formidable({
    uploadDir: path.resolve(UPLOAD_IMAGE_TEMP_DIR),
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 300 * 1024, // 300KB
    filter: ({ name, mimetype }) => {
      if (name !== 'image') {
        return false
      }

      if (!mimetype?.includes('image/')) {
        uploadError = new Error(MEDIAS_MESSAGES.ONLY_IMAGE_FILES_ARE_ALLOWED)
        return false
      }

      return true
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      if (uploadError) {
        return reject(uploadError)
      }

      if (!files.image) {
        return reject(new Error(MEDIAS_MESSAGES.NO_IMAGE_FILE_UPLOADED))
      }
      return resolve(files.image as File[])
    })
  })
}

export const handleUploadVideo = (req: Request) => {
  let uploadError: Error | null = null

  const form = formidable({
    uploadDir: path.resolve(UPLOAD_VIDEO_DIR),
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    filter: ({ name, mimetype }) => {
      if (name !== 'video') {
        return false
      }
      if (!mimetype?.includes('video/')) {
        uploadError = new Error(MEDIAS_MESSAGES.ONLY_VIDEO_FILES_ARE_ALLOWED)
        return false
      }
      return true
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      if (uploadError) {
        return reject(uploadError)
      }
      if (!files.video) {
        return reject(new Error(MEDIAS_MESSAGES.NO_VIDEO_FILE_UPLOADED))
      }
      return resolve(files.video as File[])
    })
  })
}
