import React from "react";
import axios from 'axios'
import {useNavigate} from "react-router-dom";

const Home = () => {
  //const [created_roomID, set_created_roomID] = React.useState("");
  const [entered_roomID, set_entered_roomID] = React.useState("");
  // const test=React.useRef(()=>{console.log('hi')})
  const navigate = useNavigate();
  // React.useEffect(()=>{
  // },[])

  const create_room=()=>{
    axios.get('/create_room', )
    .then(res => {
      //set_created_roomID(res.data)
      window.location.href=`/room/${res.data}`
    })
    .catch(error=>{
      alert(error.response.data.error)
    }) 
  }

  return(
    <div className="home">
      <button onClick={create_room}>New room</button><br></br>
      <input onChange={(e) => sessionStorage.setItem('name', e.target.value)} className="name_box" type="text" placeholder="name" />
      <input onChange={(e) => set_entered_roomID(e.target.value)} className="roomID_box" type="text" placeholder="room ID" />
      <button onClick={()=>(window.location.href=`/room/${entered_roomID}`)}>Join room</button>
    </div>
  )
}
export default Home