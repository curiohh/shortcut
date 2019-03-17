import { Step4, Step5 } from '../worker'
import { pad }          from '../logging'

const animate = require( '../../vendor/anim-control') as any

export default async function createPngs(context: Step4): Promise<Step5> {
  pad(context.id, "Creating animation PNGs")

  const opts = {
    style: {
      "bgColor": "#fedb55",
      "textColor2": "#333333",
      "waveColor": {
        "r": 1,
        "g": 94,
        "b": 170
      }
    },
    showNumber: context.id,
    peaks: context.peaks
  }

  return new Promise((resolve, _reject) => {
    animate.start(
      context.tempDir,
      context.startTime,
      context.duration,
      context.words,
      null,
      opts,
      context.fps,
      () => {
        resolve(context)
      }
    )
  })
}
