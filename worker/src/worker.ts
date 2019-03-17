import { arrow, pad }   from './logging'
import queue            from 'bull'
import _                from 'lodash'
import downloadFiles    from './steps/downloadFiles'
import generateWaveForm from './steps/generateWaveForm'
import attachWords      from './steps/attachWords'
import createPngs       from './steps/createPngs'
import createVideo      from './steps/createVideo'
import cleanUp          from './steps/cleanUp'
import { REDIS_URI}     from './env'

export interface Word {
  start: number,
  end: number,
  idx: number,
  text: string
}

export type Step1 = {
  id: string,
  startTime: number,
  duration: number,
  fps: number,
}

export type Step2 = Step1 & {
  tempDir: string,

  filesToDownload: {
    audio: string,
    transcript: string
  },

  tempFiles: {
    audio: string,
    transcript: string
  }
}

export type Step3 = Step2 & {
  peaks: Array<number>
}

export type Step4 = Step3 & {
  words: Array<Word>
}

export type Step5 = Step4

export type Step6 = Step5 & {
  tempOutName: string
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
      duration: 29,
      fps: 20
    }

    pad(context.id, `Starting`)
    downloadFiles(context).then(context => (
      generateWaveForm(context)
    )).then(context => (
      attachWords(context)
     )).then(context => (
      createPngs(context)
    )).then(context => (
      createVideo(context)
    ))// .then(context => (
    //   cleanUp(context)
    // ))
      .then(context => {
        pad(context.id, "Done")
        done()
      })
  })
}
