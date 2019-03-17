import { Step3, Step4 } from '../worker'
import { pad }          from '../logging'
import fs               from 'fs'
import _                from 'lodash'

export default async function attachWords(context: Step3): Promise<Step4> {
  pad(context.id, "Attaching Words")

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
