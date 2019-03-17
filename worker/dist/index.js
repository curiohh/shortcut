"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bull_1 = __importDefault(require("bull"));
var dotenv_1 = __importDefault(require("dotenv"));
// DEV MODE SETUP
if (process.env["NODE_ENV"] != "production") {
    dotenv_1.default.config();
}
var REDIS_URI = process.env["REDIS_URI"] || 'redis://localhost';
var videoQueue = new bull_1.default('video creating', REDIS_URI);
function pad(words) {
    var rest = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        rest[_i - 1] = arguments[_i];
    }
    console.log.apply(console, ["     " + words].concat(rest));
}
function arrow(words) {
    var rest = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        rest[_i - 1] = arguments[_i];
    }
    console.log.apply(console, [">>>> " + words].concat(rest));
}
videoQueue.process(function (job, done) {
    arrow("Received message", job.data.id);
});
arrow("Waiting for jobs");
