import queue  from 'bull'
import dotenv from 'dotenv'

// DEV MODE SETUP
if (process.env["NODE_ENV"] != "production") {
  dotenv.config()
}

const REDIS_URI = process.env["REDIS_URI"] || 'redis://localhost'

const videoQueue = new queue('video creating', REDIS_URI);


function pad(words: string, ...rest: Array<any>): void {
  console.log(`     ${words}`, ...rest)
}

function arrow(words: string, ...rest: Array<any>): void {
  console.log(`>>>> ${words}`, ...rest)
}

videoQueue.process((job, done): void => {
  arrow("Received message", job.data.id);
})

arrow("Waiting for jobs")
