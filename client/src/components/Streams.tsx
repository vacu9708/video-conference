import React from "react";
import My_websocket from '../my_websocket'
import Peer from 'peerjs'

let peers=new Map()
let my_stream_: MediaStream
interface ws_{
    ws: My_websocket
  }
const Streams=({ws}: ws_)=>{
    const video_grid=React.useRef<any>()
    const [play_toggled, set_play_toggled]=React.useState(false)
    const [mute_toggled, set_mute_toggled]=React.useState(false)

    const toggle_play = () => {
        let enabled = my_stream_.getVideoTracks()[0].enabled;
        if (enabled) {
            my_stream_.getVideoTracks()[0].enabled = false;
        } else {
          my_stream_.getVideoTracks()[0].enabled = true;
        }
        set_play_toggled(!play_toggled)
      }

    const toggle_mute = () => {
        const enabled = my_stream_.getAudioTracks()[0].enabled;
        if (enabled) {
            my_stream_.getAudioTracks()[0].enabled = false;
        } else {
          my_stream_.getAudioTracks()[0].enabled = true;
        }
        set_mute_toggled(!mute_toggled)
      }

      const add_video_stream=(video: HTMLVideoElement, stream: MediaStream)=>{
        video.srcObject = stream
        video.addEventListener('loadedmetadata', () => {
            video.play()
        })
        video_grid.current.append(video)
    }

    const leave_meeting=()=>{
        ws.ws.close()
        window.location.href='/'
    }

    React.useEffect(()=>{
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(my_stream => {
            my_stream_=my_stream
            const my_video = document.createElement('video')
            my_video.muted=true
            add_video_stream(my_video, my_stream)

            let my_peer: Peer
            ws.on('uuid', (json: any)=>{ // received my uuid
                my_peer=new Peer(json.uuid)
                my_peer.on('call', (call: any) => {
                    console.log('Call from a peer')
                    call.answer(my_stream)
                    const remote_video = document.createElement('video')
                    call.on('stream', (remoteStream: MediaStream) => {
                        add_video_stream(remote_video, remoteStream)
                    })
                })
                my_peer.on('open', peerID => {
                    console.log('You joined room as '+peerID)
                    ws.send(JSON.stringify({target: "new_peer", peerID: peerID}))
                })
            })
            ws.on('new_peer', (json: any)=>{ // New peer received
                console.log('you called a new peer')
                const call = my_peer.call(json.peerID, my_stream);
                const remote_video = document.createElement('video')
                call.on("stream", (remoteStream) => { // answer of the call
                    add_video_stream(remote_video, remoteStream)
                });
                call.on('close', () => {
                    remote_video.remove()
                })
                peers.set(json.peerID, call)
            })
            ws.send(JSON.stringify({target: 'uuid'}))
        })
        .catch(err => {
            console.error("Failed to get local stream", err);
        })
        
        ws.on('peer_disconnected', (json: any)=>{
            console.log('peer left')
            peers.get(json.peerID).close()
            peers.delete(json.peerID)
        })
    },[ws])

    // React.useEffect(()=>{
    //     set_render(!render)
    // },[video_grid, render])

    return(
        <>
        <div className="video_grid" ref={video_grid}></div>
        <div className="controller">
            <div className="stream_control_block">
                {play_toggled?
                <div onClick={toggle_play} className="play stream_control_button" >
                    <img src='/icons/video.webp' alt=""/>
                    <span>Play Video</span>
                </div>
                :
                <div onClick={toggle_play} className="stream_control_button" >
                    <img src='/icons/video.webp' alt=""/>
                    <span>Stop Video</span>
                </div>}
                {mute_toggled?
                <div onClick={toggle_mute} className="unmute stream_control_button" >
                    <img src='/icons/mic.webp' alt=""/>
                    <span>Unmute</span>
                </div>
                :
                <div onClick={toggle_mute} className="stream_control_button" >
                    <img src='/icons/mic.webp' alt=""/>
                    <span>Mute</span>
                </div>}
            </div>
            <div className="stream_control_block">
                <div className="stream_control_button">
                    <img src='/icons/participants.webp' alt=""/>
                    <span>Participants</span>
                </div>
                <div className="stream_control_button">
                    <img src='/icons/chat.webp' alt=""/>
                    <span>Chat</span>
                </div>
            </div>
            <div onClick={leave_meeting} className="leave_meetig stream_control_button">
                <span>Leave Meeting</span>
            </div>
        </div>
        </>
    )
}
export default Streams