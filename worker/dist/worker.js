"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var logging_1 = require("./logging");
var makeWaveForm_1 = __importDefault(require("./unclean/makeWaveForm"));
var bull_1 = __importDefault(require("bull"));
var fs_1 = __importDefault(require("fs"));
var request_1 = __importDefault(require("request"));
var lodash_1 = __importDefault(require("lodash"));
var env_1 = require("./env");
function downloadFiles(context) {
    return __awaiter(this, void 0, void 0, function () {
        var filesToDownload, tempDir, tempFiles, promises;
        return __generator(this, function (_a) {
            filesToDownload = {
                audio: env_1.FILES_BASE_URI + "/" + context.id + "+/podcast_snipped.mp3",
                transcript: env_1.FILES_BASE_URI + "/" + context.id + "+/transcript.json"
            };
            tempDir = "/tmp/shortcut-worker/" + context.id;
            tempFiles = {
                audio: tempDir + "/audio",
                transcript: tempDir + "/transcript"
            };
            if (!fs_1.default.existsSync('/tmp/shortcut-worker')) {
                fs_1.default.mkdirSync('/tmp/shortcut-worker');
            }
            if (!fs_1.default.existsSync(tempDir)) {
                fs_1.default.mkdirSync(tempDir);
            }
            promises = lodash_1.default.map(tempFiles, function (v, k) {
                return new Promise(function (resolve, reject) {
                    var localStream = fs_1.default.createWriteStream(v);
                    var fileToDownload = filesToDownload[k];
                    logging_1.pad(context.id, "Downloading " + fileToDownload);
                    var req = request_1.default.get(fileToDownload);
                    req.on('error', function (err) {
                        reject(err);
                    }).on('response', function (response) {
                        logging_1.pad(context.id, "Writing " + k + " download stream locally");
                        response.pipe(localStream);
                    }).on('end', function (_response) {
                        logging_1.pad(context.id, "Finished writing " + k + " stream");
                        resolve();
                    });
                });
            });
            return [2 /*return*/, Promise.all(promises).then(function () { return (__assign({}, context, { filesToDownload: filesToDownload,
                    tempFiles: tempFiles })); })];
        });
    });
}
function generateWaveForm(context) {
    logging_1.pad(context.id, "Generating Wave Form");
    return makeWaveForm_1.default(context.tempFiles.audio, 1000).then(function (peaks) { return (__assign({}, context, { peaks: peaks })); });
}
function attachWordArray(context) {
    return new Promise(function (resolve, reject) {
        var transcriptJSON;
        try {
            transcriptJSON = JSON.parse(fs_1.default.readFileSync(context.tempFiles.transcript, 'utf8'));
        }
        catch (err) {
            reject(new Error(err));
            return;
        }
        var words = lodash_1.default.map(lodash_1.default.filter(transcriptJSON.words, function (word) {
            var start = word.start;
            var end = word.end;
            return start >= context.startTime && end <= context.stopTime;
        }), function (word, idx) {
            return {
                start: word.start * 1000,
                end: word.end * 1000,
                text: word.word,
                idx: idx
            };
        });
        resolve(__assign({}, context, { words: words }));
    });
}
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
            stopTime: 29
        };
        logging_1.pad(context.id, "Starting");
        downloadFiles(context).then(function (context) { return (generateWaveForm(context)); }).then(function (context) { return (attachWordArray(context)); }).then(function (context) {
            logging_1.pad(context.id, "Done");
            done();
        });
    });
}
exports.default = start;
