import React from 'react'

const find_roomID=()=>{
    let url=window.location.href
    let start_of_roomID=url.length-1
    while(url[start_of_roomID]!=='/') start_of_roomID--
    return url.substring(start_of_roomID+1, url.length)
}

const DoorToRoom=()=>{
    return(
        <>
        <input onChange={(e) => sessionStorage.setItem('name', e.target.value)} className="name_box" type="text" placeholder="name"
        style={{fontSize: '30px'}}/>
        <button className={`join room button`} onClick={()=>((window.location.href=`/room/${find_roomID()}`))}style={{fontSize: '30px'}}>Join room</button>
        </>
    )
}
export default DoorToRoom