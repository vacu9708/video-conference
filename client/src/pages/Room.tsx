import React from "react";
import Messages from '../components/Messages'
import {Msg} from '../components/Messages'
import My_websocket from '../my_websocket'
import Streams from '../components/Streams'

const Room = () => {
  const [input_msg, set_input_msg] = React.useState("");
  const [participants, set_participants] = React.useState<string[]>([])
  const [messages, set_messages]=React.useState<Msg[]>([])
  const messages_ref=React.useRef<Msg[]>([])
  const message_window=React.useRef<any>()
  const ws=React.useMemo(()=>new My_websocket(`wss://${window.location.hostname}`),[])

  React.useEffect(()=>{
    // Find roomID
    let url=window.location.href
    let start_of_UUID=url.length-1
    while(url[start_of_UUID]!=='/') start_of_UUID--
    sessionStorage.setItem('roomID', url.substring(start_of_UUID+1, url.length))

    ws.on('err', (json: any)=>{
      // window.location.reload()
      alert('Multiple connections not allowed!')
      console.log(json)
    })
    ws.on('participant', (json: any)=>{
      set_participants(json.participants.split('/'))
      json={target: json.target, name: json.name, msg: json.msg}
      messages_ref.current=[...messages_ref.current, json]
      set_messages(messages_ref.current)
    })
    ws.on('chat_msg', (json: any)=>{
      json={target: json.target, name: json.name, msg: json.msg}
      messages_ref.current=[...messages_ref.current, json]
      set_messages(messages_ref.current)
    })
    const interval=setInterval(()=>{
      if(ws.is_open){
        ws.send(JSON.stringify({target: "join_room", name: sessionStorage.getItem('name'), roomID: sessionStorage.getItem('roomID')}))
        clearInterval(interval)
      }
    }, 1)
  },[])

  React.useEffect(()=>{
    message_window.current.scrollTop = message_window.current.scrollHeight
  },[messages])

  const send_msg=(e: any)=>{
    if(e.key!=='Enter')
      return
    e.preventDefault()
    ws.send(JSON.stringify({target: 'chat_msg', msg: input_msg}))
    set_input_msg('')
  }

  return(
    <div className="room_frame">
      <div className="left_window" style={{fontSize: '50px', textAlign: 'center'}}>
        {ws.is_open? <Streams ws={ws}/>: <></>}
      </div>
      <div className="chat_window">
        <div className="chat_header">
          Chat<br/>
          <div className='participants'>{participants}</div>
        </div>
        <div className="message_window" ref={message_window}>
          <Messages messages={messages}/>
        </div>
        <textarea className="msg_input" onChange={
          (e) => set_input_msg(e.target.value)} onKeyDown={send_msg} placeholder='target message here' value={input_msg} />
      </div>
    </div>
  )
}
export default Room;