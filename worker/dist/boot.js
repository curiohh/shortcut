"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = __importDefault(require("dotenv"));
// DEV MODE SETUP
function bootUp() {
    if (process.env["NODE_ENV"] != "production") {
        var result = dotenv_1.default.config();
        if (!result.error) {
            return Promise.resolve();
        }
        else {
            return Promise.reject(new Error("Unable to parse .env: " + result.error));
        }
    }
    else {
        return Promise.resolve();
    }
}
exports.default = bootUp;
