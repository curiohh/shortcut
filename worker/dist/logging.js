"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var moment_1 = __importDefault(require("moment"));
function now() {
    return moment_1.default().format('YYYY-MM-DDTHH:mm:ss:SSSSZ');
}
function pad(id, words) {
    var rest = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        rest[_i - 2] = arguments[_i];
    }
    console.log.apply(console, [now() + "      " + id + " - " + words].concat(rest));
}
exports.pad = pad;
function arrow(words) {
    var rest = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        rest[_i - 1] = arguments[_i];
    }
    console.log.apply(console, [now() + " >>>> " + words].concat(rest));
}
exports.arrow = arrow;
function error(words) {
    var rest = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        rest[_i - 1] = arguments[_i];
    }
    console.error.apply(console, [now() + " $$$$ " + words].concat(rest));
}
exports.error = error;
