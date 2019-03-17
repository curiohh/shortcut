5/**
 *  Canvas animation with paper.js
 *
 *  Create individual frames using animator module (which is same as on client-side)
 */

'use strict';

const paper = require('paper-jsdom-canvas');
const Canvas = require('canvas');

const Animator = require('./animator');
const fs = require('fs');
const path = require('path');

const data = fs.readFileSync(__dirname + '/../assets/footer.png', 'binary');
const buf = new Buffer(data, 'binary');
const string = buf.toString('base64');
const footerImgBase64 = 'data:image/png;base64,'+string;

const mult = 4;
const w = 200*mult,
      h = 200*mult;

paper.setup(new paper.Size(w, h));

function loadFont(callback) {
  // add font
  const Font = Canvas.Font;
  if (!Font) {
    throw new Error('Need to compile with font support')
  }
  function fontFile (name) {
    return path.join(__dirname, '../assets/fonts/', name);
  }

  const openSansFont = new Font('Open Sans', fontFile('Open-Sans/OpenSans-Semibold.ttf'));
  const oswaldFont = new Font('Oswald', fontFile('Oswald/Oswald-Light.ttf'));

  // myFont.addFace(fontFile('Open-Sans/OpenSans-Semibold.ttf'), 600);
  paper.view._context.addFont(openSansFont);
  paper.view._context.addFont(oswaldFont);

  callback();
}

// AnimControl
var AnimControl = function() {};

AnimControl.prototype = {
  start: function(tempDir, startTime, duration, wordArray, eventOrigin, opts, fps, cb) {
    let frame = 0,
        i = 0;

    loadFont(() => {

      setTimeout(() => {

        const totalFrames = fps*duration;

        // create Animator
        let animator = new Animator({
          paper,
          width: w,
          height: h,
          fps,
          footerImgBase64,
          showNumber: opts.showNumber,
          style: opts.style || {
            textColor1 : 'white',
            textColor2 : '#432958',
            bgColor    : '#e44226',
            waveColors: [ [255,0,255], [245,204,41], [219,188,64] ]
          }
        });

        animator.setRegion(startTime, duration, wordArray, opts.peaks);

        // override
        paper.view.exportImage =  function(path, callback) {
          this.update(true);

          const out = fs.createWriteStream(path);
          let stream = this._element.createPNGStream();

          // Pipe the stream to the write stream:
          stream.pipe(out);
          if (callback) {
            out.on('close', () => {
              callback();
              i++;
            });
          }
          return out;
        }

        paper.view.onFrame = function(event) {
          const pos = (frame/fps + startTime) * 1000;
          animator.step(pos);
          frame++;
        };

        paper.view.exportFrames({
            amount: totalFrames,
            directory: tempDir,
            prefix: '',
            padding: 3,
            extension: 'png',
            onComplete: function() {
              cb();
            }
        });
      }, 100);
    });
  }
};

module.exports = new AnimControl();
