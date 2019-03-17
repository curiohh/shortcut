import { Step5, Step6 } from '../worker'
import { pad }          from '../logging'

const merge = require('../../vendor/merge') as any

export default async function createPngs(context: Step5): Promise<Step6> {
  pad(context.id, "Creating Video")

  const tempOutName = `${context.tempDir}/video.mp4`
  return new Promise((resolve, reject) => {
    merge.mergeFiles(
      context.tempDir,
      context.tempFiles.audio,
      context.startTime,
      context.duration,
      tempOutName,
      context.fps,
      (err: any, _success: any) => {
        if (err) {
          reject(new Error(err))
        } else {
          resolve({
            ...context,
            tempOutName
          })
        }
      })
  })
}
