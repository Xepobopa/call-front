import Emitter from './Emitter'

class MediaDevice extends Emitter {
    start() {
        navigator.mediaDevices
            .getUserMedia({
                audio: true,
                video: false
            })
            .then((stream) => {
                this.stream = stream.getAudioTracks();
                this.emit('stream', stream)
            })
            .catch(console.error)

        return this
    }

    toggle(type, on) {
        if (this.stream) {
            this.stream[`get${type}Tracks`]().forEach((t) => {
                t.enabled = on ? on : !t.enabled
            })
        }

        return this
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach((t) => {
                t.stop()
            })
        }
        this.off()

        return this
    }
}

export default MediaDevice