const waveform = require('waveform-util')

export default function(filePath: string, targetWidth: number): Promise<Array<number>> {
  return new Promise((resolve, reject) => {
    function waveformDone(err: string, peaks_obj: { peaks: Array<number> }) {
      if (err && !peaks_obj) {
        reject(new Error(err))
      } else {
        resolve(peaks_obj.peaks)
      }
    }

    waveform.audio_data(filePath, function(err: string, fileData: any) {
      if (err && !fileData) {
        reject(new Error(err))
      } else {
        waveform.generate_peaks(filePath,
                                targetWidth,
                                fileData.duration,
                                fileData.bit_rate,
                                fileData.channels,
                                waveformDone);
      }
    })
  })
}
