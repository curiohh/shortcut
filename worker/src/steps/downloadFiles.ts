import { Step1, Step2 }   from '../worker'
import fs                 from 'fs'
import request            from 'request'
import _                  from 'lodash'
import { pad }            from '../logging'
import { FILES_BASE_URI } from '../env'

export default async function downloadFiles(context: Step1): Promise<Step2> {
  const filesToDownload = {
    audio: `${FILES_BASE_URI}/${context.id}+/podcast_snipped.mp3`,
    transcript: `${FILES_BASE_URI}/${context.id}+/transcript.json`
  }

  const tempDir = `/tmp/shortcut-worker/${context.id}`

  const tempFiles = {
    audio: `${tempDir}/audio`,
    transcript: `${tempDir}/transcript`
  }

  if (!fs.existsSync('/tmp/shortcut-worker')){
    fs.mkdirSync('/tmp/shortcut-worker')
  }

  if (!fs.existsSync(tempDir)){
    fs.mkdirSync(tempDir)
  }

  const promises: Array<Promise<any>> = _.map(tempFiles, (v, k) => {
    return new Promise((resolve, reject) => {
      const localStream = fs.createWriteStream(v)
      const fileToDownload = filesToDownload[k as keyof(typeof filesToDownload)]
      pad(context.id, `Downloading ${fileToDownload}`)
      const req = request.get(fileToDownload)

      req.on('error', err => {
        reject(err)
      }).on('response', response => {
        pad(context.id, `Writing ${k} download stream locally`)
        response.pipe(localStream)
      }).on('end', _response => {
        pad(context.id, `Finished writing ${k} stream`)
        resolve()
      })
    })
  })

  return Promise.all(promises).then(() => ({
    ...context,
    tempDir,
    filesToDownload,
    tempFiles
  }))
}
