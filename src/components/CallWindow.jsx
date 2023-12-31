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
                               onNewMessage,
                               nickname
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
        window.addEventListener('mousemove', onMouseMove)

        return () => {
            window.removeEventListener('mousemove', onMouseMove)
        }
    })

    useEffect(() => {
        if (remoteVideo.current && remoteSrc) {
            console.log('REMOTESRC', remoteSrc);
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
        if (deviceType === 'audio') {
            setAudio(!audio)
            mediaDevice.toggle('Audio')
        }
    }

    const onHandleChange = (e) => {
        setNewMessage(e.target.value);
    }

    const onHandleSend = (e) => {
        console.log('[INFO] onHandleSend: ', newMessage)
        setNewMessage('');
        console.log('[INFO] send new Message: ', {from: nickname, text: newMessage})
        onNewMessage({from: nickname, text: newMessage});
    }

    return (

        <div className='call-window'>
            <div className='inner'>
                <div className='video'>
                    <audio className='remote' ref={remoteVideo} autoPlay/>
                </div>

                <div>
                    {chat.map(message => {
                        return (
                            message.from === nickname ?
                                <div className={'message myMessage'} key={Math.random() * 1000}>
                                    <p className={'messageText'} style={{color: "wheat"}}>{message.text}</p>
                                </div>
                                :
                                <div className={'message otherMessage'} key={Math.random() * 1000}>
                                    <p className={'from'} style={{color: "wheat"}}>{message.from}</p>
                                    <p className={'messageText'} style={{color: "wheat"}}>{message.text}</p>
                                </div>
                        )
                    })}
                </div>

                <div>
                    <h1>Write Your message</h1>
                    <InputGroup>
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