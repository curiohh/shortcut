import { Step4 } from '../worker'
import rimraf    from 'rimraf'
import { pad }   from '../logging'

export default async function cleanUp(context: Step4): Promise<Step4> {
  pad(context.id, "Cleaning Up")

  return new Promise((resolve, _reject) => {
    rimraf(context.tempDir, () => resolve(context))
  })
}
