import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Room from './pages/Room';
import DoorToRoom from './pages/DoorToRoom';
import "./style.css";
//import My_websocket from './My_websocket'

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/door_to_room/*" element={<DoorToRoom/>}/>
          <Route path="/room/*" element={<Room/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}