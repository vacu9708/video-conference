//"use strict";
const websocket = require('ws');
const {v4} = require('uuid');

class My_websocket extends websocket.Server{
    constructor(server){
        super({server: server})
        this.targets=new Map() // socket target functions. <target: string, (client, json)=>void>
    }

    on_msg=(target, callback)=>{
        this.targets.set(target, callback)
    }

    msg_handler=(client)=>{
        client.on('message', (msg)=>{
            const json=JSON.parse(msg)
            if(this.targets.has(json.target))
                this.targets.get(json.target)(client, json)
        })
    }
}

class Room_manager{
    constructor(server){
        this.connected_ips=new Map() // []<IP, bool>
        this.rooms=new Map() // <roomID, []<client_socket, name>>
        this.clients_info=new Map() // <client_socket, []<name, roomID, peerID>
        this.peerID_to_client=new Map() // <peerID, client_socket>

        this.server_socket=new My_websocket(server)
        this.server_socket.on('connection', (client, req)=>{
            // console.log('hi')
            // Prevent multiple connections from one IP
            // if(this.connected_ips.has(req.socket)){
            //     client.send(`{"target": "err", "msg": "Existing IP${req.socket}"}`)
            //     client.close()
            //     return
            // }
            this.connected_ips.set(req.socket, true)
            this.server_socket.msg_handler(client)
            
            client.on('close', (code, reason)=>{
                try{
                    this.connected_ips.delete(req.socket)
                    
                    const name=this.clients_info.get(client)[0]
                    const roomID=this.clients_info.get(client)[1]
                    // Disconnetion message to the chat
                    this.rooms.get(roomID).delete(client)
                    let msg=JSON.stringify({target: "participant", name: name, msg: "has left the room", participants: this.get_participants(roomID)})
                    this.broadcast(roomID, msg)
                    console.log(`${name} left the room`)
                    // webRTC disconnection
                    msg=JSON.stringify({target: 'peer_disconnected', peerID: this.clients_info.get(client)[2]})
                    this.broadcast(roomID, msg)
                    // Delete client-peerID mapping
                    this.peerID_to_client.delete(this.clients_info.get(client)[2])
                    this.clients_info.delete(client)
                    // Delete the room if empty
                    if(this.rooms.get(roomID).size===0)
                        this.rooms.delete(roomID)
                }catch{}
            })
        })

        this.set_msg_targets()
    }

    set_msg_targets=()=>{ // Setup the target functions of incoming messages
        this.server_socket.on_msg('join_room', (client, parsed)=>{
            if (!this.rooms.has(parsed.roomID)){// If invalid room
                console.log(parsed.roomID)
                client.close()
                return
            }
            let name=parsed.name
            if(!name || name=='null')
                name='guest'+this.clients_info.size.toString()
            
            const roomID=parsed.roomID
            this.rooms.get(roomID).set(client, name) // Add the client to the room
            this.clients_info.set(client, [name, roomID, null]) // Set client's info
        })

        this.server_socket.on_msg('join_chat', (client, parsed)=>{
            // Broadcast the new participant in the chatroom
            const roomID=this.clients_info.get(client)[1]
            let msg=JSON.stringify({target: "participant", name: this.clients_info.get(client)[0], msg: "has entered the room", participants: this.get_participants(roomID)})
            this.broadcast(roomID, msg)
        })

        this.server_socket.on_msg('chat_msg', (client, parsed)=>{
            const roomID=this.clients_info.get(client)[1]
            const msg=JSON.stringify({target: 'chat_msg', name: this.clients_info.get(client)[0], msg: parsed.msg})
            this.broadcast(roomID, msg)
            // broadcast(`{"target": "msg", "name": "${clients_info.get(client)[0]}", "msg": "${json.msg}"}`) // doesn't work
        })

        this.server_socket.on_msg('join_RTC', (client, parsed)=>{
            // Map client_socket and peerID
            this.clients_info.get(client)[2]=parsed.peerID
            this.peerID_to_client.set(parsed.new_peerID, client)
            // Broadcast new peer's offer
            const roomID=this.clients_info.get(client)[1]
            const msg=JSON.stringify({target: 'new_peer', new_peerID: parsed.new_peerID})
            this.broadcast(roomID, msg, client)
            console.log(`${this.clients_info.get(client)[0]} joined as a peer`)
        })

        this.server_socket.on_msg("offer", (client, parsed) => {
            const new_peer_client=this.peerID_to_client.get(parsed.new_peerID)
            const msg=JSON.stringify({target: "offer", offer: parsed.offer, offering_peerID: parsed.offering_peerID})
            new_peer_client.send(msg)
        });

        this.server_socket.on_msg("answer", (client, parsed) => {
            const offering_peer_client=this.peerID_to_client.get(parsed.offering_peerID)
            const msg=JSON.stringify({target: "answer", answer: parsed.answer, new_peerID: parsed.new_peerID})
            offering_peer_client.send(msg)
        });

        this.server_socket.on_msg("ice_candidate", (client, parsed) => {
            console.log(this.clients_info.get(this.peerID_to_client.get(parsed.sending_peerID))[0] + this.clients_info.get(this.peerID_to_client.get(parsed.receiving_peerID))[0])
            const receiving_peer_client=this.peerID_to_client.get(parsed.receiving_peerID)
            const msg=JSON.stringify({target: "ice_candidate", ice_candidate: parsed.ice_candidate, sending_peerID: parsed.sending_peerID})
            receiving_peer_client.send(msg)
        });
    }

    broadcast=(roomID, msg, client=null)=>{
        for(let [member, name] of this.rooms.get(roomID)){
            if(member===client)
                continue
            member.send(msg)
        }
    }
    get_participants=(roomID)=>{
        let participants=''
        for(let [member, name] of this.rooms.get(roomID))
            participants+=`${name}, /`
        return participants
    }
}

module.exports={Room_manager}