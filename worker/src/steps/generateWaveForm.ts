import { Step2, Step3 } from '../worker'
import { pad }          from '../logging'
import  makeWaveForm    from '../unclean/makeWaveForm'

export default async function generateWaveForm(context: Step2): Promise<Step3> {
  pad(context.id, "Generating Wave Form")
  return makeWaveForm(context.tempFiles.audio, 1000).then(peaks => ({
    ...context,
    peaks: peaks
  }))
}
