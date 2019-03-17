"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var logging_1 = require("./logging");
var worker_1 = __importDefault(require("./worker"));
require("./env");
worker_1.default();
logging_1.arrow("Waiting for jobs");
