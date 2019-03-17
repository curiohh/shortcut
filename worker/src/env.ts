import dotenv from 'dotenv'

if (process.env["NODE_ENV"] != 'production') {
  dotenv.config()
}

export const REDIS_URI = process.env["REDIS_URI"] || 'redis://localhost'
export const FILES_BASE_URI = process.env["FILES_BASE_URI"] as string

if (
  !(REDIS_URI
    && FILES_BASE_URI)
) {
  throw new Error("Environment is not set up properly")
}
