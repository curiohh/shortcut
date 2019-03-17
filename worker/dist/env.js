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
if (!(exports.REDIS_URI
    && exports.FILES_BASE_URI)) {
    throw new Error("Environment is not set up properly");
}
