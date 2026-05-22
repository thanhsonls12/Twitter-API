import { UPLOAD_DIR, UPLOAD_TEMP_DIR } from '@/constants/dir.js'
import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import path from 'path'

export const initFolder = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }

  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(UPLOAD_TEMP_DIR, { recursive: true })
  }
}

export const handleUploadImage = (req: Request) => {
  let uploadError: Error | null = null
  const form = formidable({
    uploadDir: path.resolve(UPLOAD_TEMP_DIR),
    maxFiles: 4,
    keepExtensions: true,
    maxFileSize: 300 * 1024, // 300KB
    filter: ({ name, mimetype }) => {
      if (name !== 'image') {
        return false
      }

      if (!mimetype?.includes('image/')) {
        uploadError = new Error('Only image files are allowed')
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
        return reject(new Error('No image file uploaded'))
      }
      return resolve(files.image as File[])
    })
  })
}
