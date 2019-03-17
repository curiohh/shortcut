"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = __importDefault(require("dotenv"));
if (process.env["NODE_ENV"] != 'production') {
    dotenv_1.default.config();
}
exports.REDIS_URI = process.env["REDIS_URI"] || 'redis://localhost';
exports.FILES_BASE_URI = process.env["FILES_BASE_URI"];
exports.AWS_REGION = process.env["AWS_REGION"];
exports.AWS_S3_BUCKET_NAME = process.env["AWS_S3_BUCKET_NAME"];
exports.AWS_ACCESS_KEY_ID = process.env["AWS_ACCESS_KEY_ID"];
exports.AWS_SECRET_ACCESS_KEY = process.env["AWS_SECRET_ACCESS_KEY"];
if (!(exports.REDIS_URI
    && exports.FILES_BASE_URI
    && exports.AWS_REGION
    && exports.AWS_S3_BUCKET_NAME
    && exports.AWS_ACCESS_KEY_ID
    && exports.AWS_SECRET_ACCESS_KEY)) {
    throw new Error("Environment is not set up properly");
}
