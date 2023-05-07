import React from "react";
import axios from 'axios'
import {useNavigate} from "react-router-dom";

const Home = () => {
  const [created_roomID, set_created_roomID] = React.useState("");
  const [entered_roomID, set_entered_roomID] = React.useState("");
  // const test=React.useRef(()=>{console.log('hi')})
  const navigate = useNavigate();
  // React.useEffect(()=>{
  // },[])

  const create_room=()=>{
    axios.get('/create_room', )
    .then(res => { // Go to login page if sign up is successful
      set_created_roomID(res.data)
    })
    .catch(error=>{
      alert(error.response.data.error)
    }) 
  }

  const to_clip_board=async()=>{
    const textArea = document.createElement("textarea");
    textArea.value = window.location.href+'door_to_room/'+created_roomID;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand("Copy");
    document.body.removeChild(textArea);
    //await navigator.clipboard.writeText(created_roomID);
  }

  return(
    <div className="home">
      <button onClick={create_room}>Create room</button>
      <div style={{display:"flex"}}>
        {created_roomID.length>0 && <button className={`copy button`} onClick={to_clip_board}>Copy room address</button>}
        <textarea style={{resize: 'none'}} disabled={true} value={created_roomID}></textarea>
      </div>
      <input onChange={(e) => sessionStorage.setItem('name', e.target.value)} className="name_box" type="text" placeholder="name" />
      <input onChange={(e) => set_entered_roomID(e.target.value)} className="roomID_box" type="text" placeholder="room ID" />
      <button onClick={()=>(window.location.href=`/room/${entered_roomID}`)}>Join room</button>
    </div>
  )
}
export default Home