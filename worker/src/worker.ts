import { arrow, pad, error } from './logging'
import  makeWaveForm         from './unclean/makeWaveForm'
import queue                 from 'bull'
import fs                    from 'fs'
import request               from 'request'
import _                     from 'lodash'
import {
  REDIS_URI,
  FILES_BASE_URI
} from './env'

interface Word {
  start: number,
  end: number,
  idx: number,
  text: string
}

type Step1 = {
  id: string,
  startTime: number,
  stopTime: number
}

type Step2 = Step1 & {
  filesToDownload: {
    audio: string,
    transcript: string
  },

  tempFiles: {
    audio: string,
    transcript: string
  }
}

type Step3 = Step2 & {
  peaks: Array<number>
}

type Step4 = Step3 & {
  words: Array<Word>
}

async function downloadFiles(context: Step1): Promise<Step2> {
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
    filesToDownload,
    tempFiles
  }))
}

function generateWaveForm(context: Step2): Promise<Step3> {
  pad(context.id, "Generating Wave Form")
  return makeWaveForm(context.tempFiles.audio, 1000).then(peaks => ({
    ...context,
    peaks: peaks
  }))
}

function attachWordArray(context: Step3): Promise<Step4> {
  return new Promise((resolve, reject) => {
    let transcriptJSON

    try {
      transcriptJSON = JSON.parse(fs.readFileSync(context.tempFiles.transcript, 'utf8'))
    }
    catch (err) {
      reject(new Error(err))
      return
    }

    const words = _.map(
      _.filter(transcriptJSON.words, (word) => {
        const start = word.start
        const end = word.end
        return start >= context.startTime && end <= context.stopTime
      }),
      (word, idx) => {
        return {
          start: word.start * 1000,
          end: word.end * 1000,
          text: word.word,
          idx
        }
      }
    )

    resolve({
      ...context,
      words: words
    })
  })
}

export default function start(): void {
  const videoQueue = new queue('video creating', REDIS_URI);

  videoQueue.process((job, done): void => {
    arrow("Received message");

    if (!job.data.id) {
      arrow("No job id found. Nothing to do here")
      return
    }

    const context: Step1 = {
      id: job.data.id,
      startTime: 0,
      stopTime: 29
    }

    pad(context.id, `Starting`)
    downloadFiles(context).then(context => (
      generateWaveForm(context)
    )).then(context => (
      attachWordArray(context)
    )).then(context => {
      pad(context.id, "Done")
      done()
    })
  })
}
