import Emitter from './Emitter'
import MediaDevice from './MediaDevice'
import socket from './socket'

const CONFIG = {
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302"
        },
        {
            urls: "turn:relay1.expressturn.com:3478",
            username: "ef238ZHYV5YA3ND0H2",
            credential: "GpyIpSclVoKFLzgs"
        },
        // {
        //     urls: 'turn:192.158.29.39:3478?transport=udp',
        //     credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        //     username: '28224511:1379330808'
        // },
        // {
        //     urls: 'turn:192.158.29.39:3478?transport=tcp',
        //     credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        //     username: '28224511:1379330808'
        // },
        // {
        //     urls: 'turn:turn.bistri.com:80',
        //     credential: 'homeo',
        //     username: 'homeo'
        // },
        // {
        //     urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
        //     credential: 'webrtc',
        //     username: 'webrtc'
        // },
        // {
        //     urls: 'turn:192.158.29.39:3478?transport=udp',
        //     credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        //     username: '28224511:1379330808'
        // },
        // {
        //     urls: 'turn:192.158.29.39:3478?transport=tcp',
        //     credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        //     username: '28224511:1379330808'
        // }
    ]
}

class PeerConnection extends Emitter {
    constructor(remoteId) {
        super()
        this.remoteId = remoteId

        this.pc = new RTCPeerConnection(CONFIG)
        this.pc.onicecandidate = ({candidate}) => {
            socket.emit('call', {
                to: this.remoteId,
                candidate
            })
        }
        this.pc.ontrack = ({streams}) => {
            this.emit('remoteStream', streams[0])
        }

        this.mediaDevice = new MediaDevice();
        this.getDescription = this.getDescription.bind(this)
    }

    start(isCaller, config) {
        this.createChannel();
        this.mediaDevice
            .on('stream', (stream) => {
                stream.getTracks().forEach((t) => {
                    this.pc.addTrack(t, stream)
                })

                this.emit('localStream', stream)

                isCaller
                    ? socket.emit('request', {to: this.remoteId})
                    : this.createOffer()
            })
            .start(config)

        return this
    }

    stop(isCaller) {
        if (isCaller) {
            socket.emit('end', {to: this.remoteId})
        }
        this.mediaDevice.stop()
        //this.pc.restartIce()
        this.pc.close();
        this.off()

        return this
    }

    createOffer() {
        this.pc.createOffer().then(this.getDescription).catch(console.error)

        return this
    }

    createAnswer() {
        this.pc.createAnswer().then(this.getDescription).catch(console.error)

        return this
    }

    async getDescription(desc) {
        await this.pc.setLocalDescription(desc)

        socket.emit('call', {to: this.remoteId, sdp: desc})

        return this
    }

    createChannel() {
        console.log('[INFO] create channel');
        try {
            this.channel = this.pc.createDataChannel('channel');
            this.channel.onclose = () => {
                console.log('[CLOSE] DataChannel')
            }
        } catch (e) {
            console.error('[ERROR Fail to create a data channel: ', e)
        }
    }

    listenMessages(cb) {
        console.log('[INFO] listenMessages event');
        console.log('Channel: ', this.channel);
        this.pc.addEventListener('datachannel', event => {
            console.log("[INFO] datachannel event");
            const channel = event.channel;
            channel.addEventListener('message', data => {
                console.log('[SUCCESS] new Message received!: ', JSON.parse(data.data));
                cb(JSON.parse(data.data));
            })
        })
    }

    sendMessage(message) {
        console.log('[INFO] sendMessage channel!');
        this.channel.send(message);
    }

    async setRemoteDescription(desc) {
        await this.pc.setRemoteDescription(new RTCSessionDescription(desc))

        return this
    }

    async addIceCandidate(candidate) {
        if (candidate) {
            try {
                await this.pc.addIceCandidate(new RTCIceCandidate(candidate))
            } catch (e) {
                console.log('[ERROR] ', e);
            }
        }

        return this
    }
}

export default PeerConnection