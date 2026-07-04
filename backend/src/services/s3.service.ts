import { env } from '../config/env.js'

export async function uploadImage(
  dataUrlOrBuffer: string,
  key: string,
): Promise<string> {
  if (!env.awsS3Bucket) {
    if (dataUrlOrBuffer.startsWith('data:')) {
      return dataUrlOrBuffer
    }
    return `local://${key}`
  }

  try {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
    const client = new S3Client({ region: env.awsRegion })

    let body: Buffer
    let contentType = 'image/jpeg'

    if (dataUrlOrBuffer.startsWith('data:')) {
      const match = dataUrlOrBuffer.match(/^data:([^;]+);base64,(.+)$/)
      if (!match) throw new Error('Invalid data URL')
      contentType = match[1]
      body = Buffer.from(match[2], 'base64')
    } else {
      body = Buffer.from(dataUrlOrBuffer, 'base64')
    }

    await client.send(
      new PutObjectCommand({
        Bucket: env.awsS3Bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    )

    return `https://${env.awsS3Bucket}.s3.${env.awsRegion}.amazonaws.com/${key}`
  } catch (err) {
    console.warn('S3 upload failed, using data URL fallback:', err)
    return dataUrlOrBuffer.startsWith('data:') ? dataUrlOrBuffer : `local://${key}`
  }
}
