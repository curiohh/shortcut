/**
 *  Merge video frames + audio w/ FFMPEG
 */

'use strict';

const child_process = require('child_process');

module.exports = {

  // fileNames is an array of files
  // example:
  // ffmpeg -i "concat:580_64k_024.ts|580_64k_025.ts" -framerate 15 -i %03d.png -c:v libx264 -r 30 -bsf:a aac_adtstoasc -strict -2 chunk.mp4
  mergeFiles: function(tempDir, fileName, startTime, duration, tempOutName, fps, callback) {
    var inputString = 'concat:' + fileName;
    var fadeTime = 0.002;
    // first we clip the audio
    console.log("Clipping Audio")
    child_process.execFile(
      'ffmpeg',
      [
        '-y',
        '-loglevel', 'warning',
        '-i', inputString,
        '-strict', '-2',
        '-ss', startTime,
        '-t', duration,
        `${tempDir}/audio.wav`
      ],
      function(err, stdout, stderr) {
        console.log("Doing another thing")
        child_process.execFile(
          'ffmpeg',
          [
            '-y',
            '-loglevel', 'warning',
            '-i', `${tempDir}/audio.wav`,
            '-framerate', fps,
            '-i', `${tempDir}/%03d.png`,
            '-pix_fmt', 'yuv420p',
            '-c:v', 'libx264',
            '-r', fps,
            '-bsf:a', 'aac_adtstoasc',
            '-strict', '-2',
            '-to', duration,
            // fade in / out
            '-af', 'afade=t=in:st=0:d=' + fadeTime + ', afade=t=out:st=' + String(duration - fadeTime)  + ':d=' + fadeTime,
            tempOutName
          ],
          function(err, stdout, stderr) {
            // FFmpeg done;
            // delete the leftover image files
            console.log("delete leftover image files")
            child_process.exec(`rm ${tempDir}/*.png`, (error, stdout, stderr) => {
              console.log(`stdout: ${stdout}`);
              console.log(`stderr: ${stderr}`);
              if (error !== null) {
                console.log(`exec error: ${error}`);
              }
              console.log('deleting any leftover image files...');
              return callback(err, 'FFmpeg finished:' + JSON.stringify({ stdout: stdout, stderr: stderr}));
            });
          });
      });
  }

};
