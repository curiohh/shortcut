import dotenv from 'dotenv'

if (process.env["NODE_ENV"] != 'production') {
  dotenv.config()
}

export const REDIS_URI             = process.env["REDIS_URI"] || 'redis://localhost'
export const FILES_BASE_URI        = process.env["FILES_BASE_URI"] as string
export const AWS_REGION            = process.env["AWS_REGION"] as string
export const AWS_S3_BUCKET_NAME    = process.env["AWS_S3_BUCKET_NAME"] as string
export const AWS_ACCESS_KEY_ID     = process.env["AWS_ACCESS_KEY_ID"] as string
export const AWS_SECRET_ACCESS_KEY = process.env["AWS_SECRET_ACCESS_KEY"] as string

if (
  !(REDIS_URI
    && FILES_BASE_URI
    && AWS_REGION
    && AWS_S3_BUCKET_NAME
    && AWS_ACCESS_KEY_ID
    && AWS_SECRET_ACCESS_KEY)
) {
  throw new Error("Environment is not set up properly")
}
