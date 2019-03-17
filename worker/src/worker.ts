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
  pad("Downloading Files")

  const filesToDownload = {
    audio: `${FILES_BASE_URI}/podcast_snipped.mp3`,
    transcript: `${FILES_BASE_URI}/transcript.json`
  }

  const tempFiles = {
    audio: `/tmp/shortcut-worker/${context.id}/audio`,
    transcript: `/tmp/shortcut-worker/${context.id}/transcript`
  }

  const promises: Array<Promise<any>> = _.map(tempFiles, (v, k) => {
    return new Promise((resolve, reject) => {
      const localStream = fs.createWriteStream(v)
      const req = request.get(filesToDownload[k as keyof(typeof filesToDownload)])

      req.on('error', err => {
        reject(err)
      }).on('response', response => {
        response.pipe(localStream)
      }).on('end', _response => {
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
  pad("Generating Wave Form")
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

    pad("Starting ${context.id }")
    downloadFiles(context).then(context => (
      generateWaveForm(context)
    )).then(context => (
      attachWordArray(context)
    )).then(context => {
      arrow(JSON.stringify(context, null, 2))
      done()
    })
  })
}
