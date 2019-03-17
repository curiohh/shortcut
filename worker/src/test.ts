import { arrow }     from './logging'
import queue         from 'bull'
import { REDIS_URI } from './env'

const videoQueue = new queue('video creating', REDIS_URI);
const id = "96e24059-c6bd-40bf-977b-5d87e368fed9"

arrow(`Adding ${id}`)

videoQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result ${result}`);
})

videoQueue.add({id: id})
