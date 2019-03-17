"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var logging_1 = require("./logging");
var bull_1 = __importDefault(require("bull"));
var downloadFiles_1 = __importDefault(require("./steps/downloadFiles"));
var generateWaveForm_1 = __importDefault(require("./steps/generateWaveForm"));
var attachWords_1 = __importDefault(require("./steps/attachWords"));
var createPngs_1 = __importDefault(require("./steps/createPngs"));
var createVideo_1 = __importDefault(require("./steps/createVideo"));
var env_1 = require("./env");
function start() {
    var videoQueue = new bull_1.default('video creating', env_1.REDIS_URI);
    videoQueue.process(function (job, done) {
        logging_1.arrow("Received message");
        if (!job.data.id) {
            logging_1.arrow("No job id found. Nothing to do here");
            return;
        }
        var context = {
            id: job.data.id,
            startTime: 0,
            duration: 29,
            fps: 20
        };
        logging_1.pad(context.id, "Starting");
        downloadFiles_1.default(context).then(function (context) { return (generateWaveForm_1.default(context)); }).then(function (context) { return (attachWords_1.default(context)); }).then(function (context) { return (createPngs_1.default(context)); }).then(function (context) { return (createVideo_1.default(context)); }) // .then(context => (
            //   cleanUp(context)
            // ))
            .then(function (context) {
            logging_1.pad(context.id, "Done");
            done();
        });
    });
}
exports.default = start;
