import React from 'react'

const find_roomID=()=>{
    let url=window.location.href
    let p=url.length-1
    while(url[p]!=='/') p--
    return url.substring(p+1, url.length)
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