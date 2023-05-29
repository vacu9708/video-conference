import React from "react";
import My_websocket from '../My_websocket'
import uuid from 'react-uuid'

let my_stream: MediaStream
const peer_connections = new Map<string, RTCPeerConnection>()
// let my_data_channel: RTCDataChannel
const peerID = uuid()
interface My_websocket_{
    ws: My_websocket
}
const Streams=({ws}: My_websocket_)=>{
    const video_grid=React.useRef<any>()
    const [play_toggled, set_play_toggled]=React.useState(false)
    const [mute_toggled, set_mute_toggled]=React.useState(false)

    const toggle_play = () => {
        let enabled = my_stream.getVideoTracks()[0].enabled;
        if (enabled) {
            my_stream.getVideoTracks()[0].enabled = false;
        } else {
          my_stream.getVideoTracks()[0].enabled = true;
        }
        set_play_toggled(!play_toggled)
      }

    const toggle_mute = () => {
        const enabled = my_stream.getAudioTracks()[0].enabled;
        if (enabled) {
            my_stream.getAudioTracks()[0].enabled = false;
        } else {
          my_stream.getAudioTracks()[0].enabled = true;
        }
        set_mute_toggled(!mute_toggled)
      }

      const add_video_stream=(video: HTMLVideoElement, stream: MediaStream)=>{
        video.srcObject = stream
        video.onloadedmetadata = () => {
            video.play();
        }
        video_grid.current.append(video)
    }

    const leave_meeting=()=>{
        ws.close()
        window.location.href='/'
    }

    const copy_room_address=async()=>{
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("Copy");
        document.body.removeChild(textArea);
        //await navigator.clipboard.writeText(created_roomID);
      }

    const create_peer_connection= (receiving_peerID: string)=>{
        // Make my peer connection
        const my_peer_connection = new RTCPeerConnection({
            iceServers: [ // The STUN server enables clients to find out their public IP address
            {
                urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
                "stun:stun3.l.google.com:19302",
                "stun:stun4.l.google.com:19302",
                ],
            },
            ],
        })
        my_peer_connection.addEventListener("icecandidate", (data: any)=>{
            console.log("ice candidate");
            ws.send(JSON.stringify({target: "ice_candidate", ice_candidate: data.candidate, sending_peerID: peerID, receiving_peerID: receiving_peerID}))
        })
        my_peer_connection.addEventListener("addstream", (data: any)=>{
            console.log("received a remote stream");
            const remote_video = document.createElement('video')
            add_video_stream(remote_video, data.stream)
        })
        my_stream.getTracks().forEach((track) => my_peer_connection.addTrack(track, my_stream)) // Add my stream to my peer connection
        return my_peer_connection
    }

    const make_my_stream= async()=>{
        // Turn on my media stream
        try{
            my_stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true})
            const my_video = document.createElement('video')
            my_video.muted=true // To prevent echo
            add_video_stream(my_video, my_stream)
        }
        catch(err) {
            console.error("Failed to get local stream", err);
        }
    }
    
    React.useEffect(()=>{
        // webRTC signaling
        ws.on("new_peer", async (parsed: any) => {
            // my_data_channel = my_peer_connection.createDataChannel("chat");
            // my_data_channel.addEventListener("message", (event: any) => console.log(event.data));

            // Createa a my peer connection
            const peer_connection = create_peer_connection(parsed.new_peerID)
            peer_connections.set(parsed.new_peerID, peer_connection);
            // Create an offer
            const offer = await peer_connection.createOffer();
            peer_connection.setLocalDescription(offer);
            // Send the offer
            ws.send(JSON.stringify({target: "offer", offer: offer, new_peerID: parsed.new_peerID, offering_peerID: peerID}))
            console.log("sent an offer to a remote peer");
        })

        ws.on("offer", async (parsed: any) => {
            // my_peer_connection.addEventListener("datachannel", (event) => {
            //     my_data_channel = event.channel;
            //     my_data_channel.addEventListener("message", (event) =>
            //         console.log(event.data)
            //     );
            // });

            // Createa a remote peer connection
            const peer_connection = create_peer_connection(parsed.offering_peerID)
            peer_connections.set(parsed.offering_peerID, peer_connection);
            peer_connection.setRemoteDescription(parsed.offer);
            // Create an answer
            const answer = await peer_connection.createAnswer();
            peer_connection.setLocalDescription(answer);
            // Send the answer
            ws.send(JSON.stringify({target: "answer", answer: answer, new_peerID: peerID, offering_peerID: parsed.offering_peerID}))
            console.log("received an offer and sent an answer back");
        });
        
        ws.on("answer", (parsed: any) => {
            // Received answer from a remote user, set it as remote description
            const peer_connection = peer_connections.get(parsed.new_peerID);
            if (peer_connection) {
                peer_connection.setRemoteDescription(parsed.answer);
            }
            console.log("received an answer");
        });

        ws.on("ice_candidate", (parsed: any) => { // must not be executed before setRemoteDescription()
            console.log("received an ice candidate");
            // Received ICE candidate from a remote user, add it to the peer connection
            const peer_connection = peer_connections.get(parsed.sending_peerID);
            if (peer_connection) {
                peer_connection.addIceCandidate(parsed.ice_candidate);
            }
        });

        ws.on('peer_disconnected', (parsed: any) => {
            // Close the peer connection
            const peer_connection = peer_connections.get(parsed.peerID);
            if (peer_connection) {
                peer_connection.close();
                peer_connections.delete(parsed.peerID);
            }
        })
        
        const webRTC_init = async () => {
            await make_my_stream(); // What if await is omitted?
            ws.send(JSON.stringify({ target: "join_RTC", new_peerID: peerID}));
        };
        webRTC_init()
    },[ws])

    // React.useEffect(()=>{
    //     set_render(!render)
    // },[video_grid, render])

    return(
        <div className="left_window" style={{fontSize: '50px', textAlign: 'center'}}>
            <div className="video_grid" ref={video_grid}></div>
            <div className="control_bar">
                <div className="control_block">
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
                <div className="control_block">
                    <div className="stream_control_button">
                        <img src='/icons/participants.webp' alt=""/>
                        <span>Participants</span>
                    </div>
                    <div onClick={copy_room_address} className="stream_control_button">
                        <img src='/icons/chat.webp' alt=""/>
                        <span>Copy room address</span>
                    </div>
                </div>
                <div onClick={leave_meeting} className="leave_meetig stream_control_button">
                    <span>Leave Meeting</span>
                </div>
            </div>
        </div>
    )
}
export default Streams