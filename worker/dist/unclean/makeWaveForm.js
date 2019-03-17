"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var waveform = require('waveform-util');
function default_1(filePath, targetWidth) {
    return new Promise(function (resolve, reject) {
        function waveformDone(err, peaks_obj) {
            if (err && !peaks_obj) {
                reject(new Error(err));
            }
            else {
                resolve(peaks_obj.peaks);
            }
        }
        waveform.audio_data(filePath, function (err, fileData) {
            if (err && !fileData) {
                reject(new Error(err));
            }
            else {
                waveform.generate_peaks(filePath, targetWidth, fileData.duration, fileData.bit_rate, fileData.channels, waveformDone);
            }
        });
    });
}
exports.default = default_1;
