"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var logging_1 = require("./logging");
var bull_1 = __importDefault(require("bull"));
var env_1 = require("./env");
var videoQueue = new bull_1.default('video creating', env_1.REDIS_URI);
var id = "96e24059-c6bd-40bf-977b-5d87e368fed9";
logging_1.arrow("Adding " + id);
videoQueue.on('completed', function (job, result) {
    console.log("Job " + job.id + " completed with result " + result);
});
videoQueue.add({ id: id });
