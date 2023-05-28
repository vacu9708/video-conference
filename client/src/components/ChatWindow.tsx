import React from 'react'
import My_websocket from '../My_websocket'

export interface Msg{
    target: string;
    name: string
    msg: string;
}
interface My_websocket_{
    ws: My_websocket
}

const get_time=()=>{
    const date=new Date()
    const hour=date.getHours()
    const minute=date.getMinutes()
    return `${hour}:${minute}`
}

const Messages=({ws}: My_websocket_)=>{
    const [participants, set_participants] = React.useState<string[]>([])
    const [messages, set_messages]=React.useState<Msg[]>([])
    const messages_ref=React.useRef<Msg[]>([])
    const message_window=React.useRef<any>()
    const [input_msg, set_input_msg] = React.useState("");
  
    React.useEffect(()=>{
      ws.on('participant', (parsed: any)=>{
        set_participants(parsed.participants.split('/'))
        parsed={target: parsed.target, name: parsed.name, msg: parsed.msg}
        messages_ref.current=[...messages_ref.current, parsed]
        set_messages(messages_ref.current)
      })
      ws.on('chat_msg', (parsed: any)=>{
        parsed={target: parsed.target, name: parsed.name, msg: parsed.msg}
        messages_ref.current=[...messages_ref.current, parsed]
        set_messages(messages_ref.current)
      })

      ws.send(JSON.stringify({target: "join_chat", name: sessionStorage.getItem('name'), roomID: sessionStorage.getItem('roomID')}))
    },[])

    React.useEffect(()=>{
        message_window.current.scrollTop = message_window.current.scrollHeight
    },[messages])

    const send_msg=(e: React.KeyboardEvent)=>{
        if(e.key!=='Enter')
          return
        e.preventDefault()
        ws.send(JSON.stringify({target: 'chat_msg', msg: input_msg}))
        //ws.send(parsed.stringify({target: 'chat_msg', name: sessionStorage.getItem('name'), msg: input_msg}))
        set_input_msg('')
      }

    return(
    <div className="chat_window">
        <div className="chat_header">
          Chat<br/>
          <div className='participants'>{participants}</div>
        </div>
        <div className="message_window" ref={message_window}>
            <>
            {messages.map((message, i)=>(
                message.target==='chat_msg'?
                <div className='msg' key={i}>
                    <div style={{fontSize: '20px'}}>{message.name} {`(${get_time()})`}</div>
                    {message.msg}
                </div>
                : message.target==='participant'?
                <div className='new_participant_msg' key={i}>
                    {`${message.name} ${message.msg}`}
                </div>
                :{}
            ))}
            </>
        </div>
        <textarea className="msg_input" onChange={
          (e) => set_input_msg(e.target.value)} onKeyDown={send_msg} placeholder='target message here' value={input_msg} />
    </div>)
}
// export default Messages
export default React.memo(Messages);