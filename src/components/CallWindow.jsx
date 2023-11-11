import {useEffect, useRef, useState} from 'react'
import {FiPhoneOff} from "react-icons/fi";
import {BsPhone} from "react-icons/bs";
import {InputGroup} from "react-bootstrap";

export const CallWindow = ({
                               remoteSrc,
                               localSrc,
                               config,
                               mediaDevice,
                               finishCall,
                               chat,
                               onNewMessage
                           }) => {
    const remoteVideo = useRef()
    const localVideo = useRef()
    const localVideoSize = useRef()
    const [video, setVideo] = useState(config?.video)
    const [audio, setAudio] = useState(config?.audio)
    const [newMessage, setNewMessage] = useState('');
    const [from, setFrom] = useState('');

    const [dragging, setDragging] = useState(false)
    const [coords, setCoords] = useState({
        x: 0,
        y: 0
    })

    useEffect(() => {
        const {width, height} = localVideo.current.getBoundingClientRect()
        localVideoSize.current = {width, height}
    }, [])

    useEffect(() => {
        dragging
            ? localVideo.current.classList.add('dragging')
            : localVideo.current.classList.remove('dragging')
    }, [dragging])

    useEffect(() => {
        window.addEventListener('mousemove', onMouseMove)

        return () => {
            window.removeEventListener('mousemove', onMouseMove)
        }
    })

    useEffect(() => {
        if (remoteVideo.current && remoteSrc) {
            remoteVideo.current.srcObject = remoteSrc
        }
        if (localVideo.current && localSrc) {
            localVideo.current.srcObject = localSrc
        }
    }, [remoteSrc, localSrc])

    useEffect(() => {
        if (mediaDevice) {
            //mediaDevice.toggle('Video', video)
            mediaDevice.toggle('Audio', audio)
        }
    }, [mediaDevice])

    const onMouseMove = (e) => {
        if (dragging) {
            setCoords({
                x: e.clientX - localVideoSize.current.width / 2,
                y: e.clientY - localVideoSize.current.height / 2
            })
        }
    }

    const toggleMediaDevice = (deviceType) => {
        // if (deviceType === 'video') {
        //     setVideo(!video)
        //     mediaDevice.toggle('Video')
        // }
        setAudio(!audio)
        mediaDevice.toggle('Audio')
    }

    const onHandleChange = (e) => {
        setNewMessage(e.target.value);
    }

    const onHandleSend = (e) => {
        console.log('[INFO] onHandleSend: ', newMessage)
        onNewMessage({from, text: newMessage});
    }

    return (

        <div className='call-window'>
            <div className='inner'>
                <div className='video'>
                    <video className='remote' ref={remoteVideo} autoPlay/>
                    <video
                        className='local'
                        ref={localVideo}
                        autoPlay
                        muted
                        onClick={() => setDragging(!dragging)}
                        style={{
                            top: `${coords.y}px`,
                            left: `${coords.x}px`
                        }}
                    />
                </div>

                {/*Chat*/}
                <div>
                    <div>
                        <h1 style={{color: "white"}}>CHAT</h1>
                        {chat.map(message => {
                            return (
                                <div key={Math.random() * 1000}>
                                    <h4 style={{color: "white"}}>{message.from}:</h4>
                                    <h5 style={{color: "white"}}>{message.text}</h5>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div>
                    <h1>Write Your message</h1>
                    <InputGroup>

                        <input type="text" className="form-control" placeholder="From" aria-label="message"
                               onChange={e => setFrom(e.target.value)}/>
                        <input type="text" className="form-control" placeholder="Message..." aria-label="message"
                               onChange={onHandleChange}/>
                    </InputGroup>
                    <button className="btn btn-primary" style={{borderRadius: '13%'}} onClick={onHandleSend}>Send
                    </button>
                </div>

                <div className='control'>
                    <button
                        className={audio ? '' : 'reject'}
                        onClick={() => toggleMediaDevice('audio')}
                    >
                        <BsPhone/>
                    </button>
                    <button className='reject' onClick={() => finishCall(true)}>
                        <FiPhoneOff/>
                    </button>
                </div>
            </div>
        </div>
    )
}