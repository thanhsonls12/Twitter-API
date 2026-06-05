import { envConfig } from '@/config/env.js'
import supabase from '@/config/supabase.js'
import fs from 'fs'
import path from 'path'
export async function uploadToSupabase({
  bucket,
  filePath,
  fileName
}: {
  bucket: 'images' | 'videos'
  filePath: string
  fileName: string
}) {
  const fileBuffer = fs.readFileSync(filePath)
  const ext = path.extname(fileName)

  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(uniqueName, fileBuffer, {
      contentType: getContentType(ext),
      upsert: false
    })
  if (error) {
    throw new Error(`Failed to upload file to Supabase: ${error.message}`)
  }
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

function getContentType(ext: string): string {
  const map: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.mkv': 'video/x-matroska'
  }

  return map[ext.toLowerCase()] || 'application/octet-stream'
}

export async function deleteFromSupabase(
  bucket: 'images' | 'videos',
  fileUrl: string
) {
  const baseUrl = `${envConfig.SUPABASE_URL}/storage/v1/object/public/${bucket}/`

  const filePath = fileUrl.replace(baseUrl, '')

  const { error } = await supabase.storage.from(bucket).remove([filePath])

  if (error) {
    throw new Error(`Failed to delete file from Supabase: ${error.message}`)
  }
}

export async function uploadFolderToSupabase({
  bucket,
  folderPath,
  remotePrefix
}: {
  bucket: 'images' | 'videos'
  folderPath: string
  remotePrefix: string
}) {
  const uploadedUrls: Record<string, string> = {}

  const uploadRecursively = async (dirPath: string, currentPrefix: string) => {
    const entries = await fs.promises.readdir(dirPath, {
      withFileTypes: true
    })

    await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dirPath, entry.name)
        const remotePath = path.posix.join(currentPrefix, entry.name)
        if (entry.isDirectory()) {
          await uploadRecursively(fullPath, remotePath)
        } else {
          const fileBuffer = await fs.promises.readFile(fullPath)
          const ext = path.extname(entry.name).toLowerCase()
          const mimeMap: Record<string, string> = {
            '.m3u8': 'application/vnd.apple.mpegurl',
            '.ts': 'video/mp2t'
          }
          const { error } = await supabase.storage
            .from(bucket)
            .upload(remotePath, fileBuffer, {
              contentType: mimeMap[ext] || 'application/octet-stream',
              upsert: true
            })
          if (error) {
            throw new Error(
              `Failed to upload file ${remotePath} to Supabase: ${error.message}`
            )
          }

          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(remotePath)

          uploadedUrls[remotePath] = urlData.publicUrl
        }
      })
    )
  }

  await uploadRecursively(folderPath, remotePrefix)

  return uploadedUrls
}
