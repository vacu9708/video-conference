import React from 'react'

export interface Msg{
    target: string;
    name: string
    msg: string;
}

interface Msgs{
    messages: Msg[]
}

const get_time=()=>{
    const date=new Date()
    const hour=date.getHours()
    const minute=date.getMinutes()
    return `${hour}:${minute}`
}

const Messages=({messages}: Msgs)=>{
    return(
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
    </>)
}
// export default Messages
export default React.memo(Messages);