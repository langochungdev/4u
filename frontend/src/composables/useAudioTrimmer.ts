import { ref } from 'vue'

export function useAudioTrimmer() {
  const isTrimming = ref(false)
  const trimProgress = ref(0)

  const trimAudio = async (
    file: File,
    startTime: number,
    duration: number = 15
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      isTrimming.value = true
      trimProgress.value = 0

      const audioContext = new AudioContext()
      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer
          trimProgress.value = 30

          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
          trimProgress.value = 50

          const sampleRate = audioBuffer.sampleRate
          const startSample = Math.floor(startTime * sampleRate)
          const endSample = Math.min(
            Math.floor((startTime + duration) * sampleRate),
            audioBuffer.length
          )
          const trimmedLength = endSample - startSample

          const trimmedBuffer = audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            trimmedLength,
            sampleRate
          )

          for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel)
            const trimmedData = trimmedBuffer.getChannelData(channel)
            for (let i = 0; i < trimmedLength; i++) {
              trimmedData[i] = channelData[startSample + i] || 0
            }
          }

          trimProgress.value = 80

          const offlineContext = new OfflineAudioContext(
            trimmedBuffer.numberOfChannels,
            trimmedBuffer.length,
            trimmedBuffer.sampleRate
          )

          const source = offlineContext.createBufferSource()
          source.buffer = trimmedBuffer
          source.connect(offlineContext.destination)
          source.start()

          const renderedBuffer = await offlineContext.startRendering()
          trimProgress.value = 90

          const wav = audioBufferToWav(renderedBuffer)
          const blob = new Blob([wav], { type: 'audio/wav' })
          
          const trimmedFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, '_trimmed.wav'),
            { type: 'audio/wav' }
          )

          trimProgress.value = 100
          isTrimming.value = false
          resolve(trimmedFile)
        } catch (error) {
          isTrimming.value = false
          reject(error)
        }
      }

      reader.onerror = () => {
        isTrimming.value = false
        reject(new Error('Failed to read file'))
      }

      reader.readAsArrayBuffer(file)
    })
  }

  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44
    const arrayBuffer = new ArrayBuffer(length)
    const view = new DataView(arrayBuffer)
    const channels: Float32Array[] = []
    let offset = 0
    let pos = 0

    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true)
      pos += 2
    }

    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true)
      pos += 4
    }

    setUint32(0x46464952)
    setUint32(length - 8)
    setUint32(0x45564157)
    setUint32(0x20746d66)
    setUint32(16)
    setUint16(1)
    setUint16(buffer.numberOfChannels)
    setUint32(buffer.sampleRate)
    setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels)
    setUint16(buffer.numberOfChannels * 2)
    setUint16(16)
    setUint32(0x61746164)
    setUint32(length - pos - 4)

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i))
    }

    while (pos < length) {
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i]?.[offset] || 0))
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff
        view.setInt16(pos, sample, true)
        pos += 2
      }
      offset++
    }

    return arrayBuffer
  }

  return {
    trimAudio,
    isTrimming,
    trimProgress
  }
}
