import { Step6, Step7 } from '../worker'
import { pad }          from '../logging'
import AWS              from 'aws-sdk'
import fs               from 'fs'
import {
  AWS_REGION,
  AWS_S3_BUCKET_NAME
} from '../env'

AWS.config.update({
  region: AWS_REGION,
  credentials: new AWS.EnvironmentCredentials("AWS")
});

const merge = require('../../vendor/merge') as any

export default async function createPngs(context: Step6): Promise<Step7> {
  pad(context.id, "Uploading Video")

  const dstKey = `snippet_videos/completed/${context.id}.mp4`

  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(context.tempOutName)

    const params = {
      ACL: 'public-read',
      Bucket: AWS_S3_BUCKET_NAME,
      Key: dstKey,
      ContentType: 'video/mpeg',
      CacheControl: 'max-age=31536000', // 1 year (60 * 60 * 24 * 365)
      Body: readStream
    }

    const s3 = new AWS.S3({
      apiVersion: '2006-03-01'
    })

    s3.upload(params).send((err: any, result: any) => {
      if (err) {
        reject(new Error(err))
      } else {
        resolve({
          ...context,
          uploadResult: result,
          dstKey
        })
      }
    })
  })
}
