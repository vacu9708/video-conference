import React, { useState } from "react";
import ChatWindow from '../components/ChatWindow'
import My_websocket from '../My_websocket'
import StreamWindow from '../components/StreamWindow'

const Room = () => {
  const ws=React.useMemo(()=>new My_websocket(`wss://${window.location.hostname}`),[])
  const [isWsOpen, setIsWsOpen] = useState(false);  

  React.useEffect(()=>{
    // Find roomID
    let url=window.location.href
    let start_of_roomID=url.length-1
    while(url[start_of_roomID]!=='/') start_of_roomID--
    sessionStorage.setItem('roomID', url.substring(start_of_roomID+1, url.length))

    ws.on('err', (parsed: any)=>{
      // window.location.reload()
      alert('Multiple connections not allowed!')
      console.log(parsed)
    })
    const interval=setInterval(()=>{ // Wait until the websocket is open to join the room
        if(ws.is_open){
          ws.send(JSON.stringify({target: "join_room", roomID: sessionStorage.getItem('roomID')}))
          setIsWsOpen(true);
          clearInterval(interval)
        }
    }, 1)
  },[])

  return(
    <div className="room_frame">
      {isWsOpen && <StreamWindow ws={ws}/>}
      {isWsOpen && <ChatWindow ws={ws}/>}
    </div>
  )
}
export default Room;