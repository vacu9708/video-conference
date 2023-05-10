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
        this.rooms=new Map() // <roomID, Map<room, [client, name]>>
        this.clients_info=new Map() // <client, [name, roomID, peerID]>
        this.connected_ips=new Map() // <IP, bool>

        this.server_socket=new My_websocket(server)
        this.server_socket.on('connection', (client, req)=>{
            console.log('hi')
            // Prevent multiple connections from one IP
            if(this.connected_ips.has(req.socket.remoteAddress)){
                client.send(`{"target": "err", "msg": "Existing IP${req.socket.remoteAddress}"}`)
                client.close()
                return
            }
            this.connected_ips.set(req.socket.remoteAddress, true)
            this.server_socket.msg_handler(client)
            
            client.on('close', (code, reason)=>{
                try{
                    this.connected_ips.delete(req.socket.remoteAddress)
                    const roomID=this.clients_info.get(client)[1]
                    const name=this.clients_info.get(client)[0]
                    console.log(`${name} left the room`)
                    this.rooms.get(roomID).delete(client)
                    let msg=JSON.stringify({target: "participant", name: name, msg: "has left the room", participants: this.get_participants(roomID)})
                    this.broadcast(roomID, msg)
                    msg=JSON.stringify({target: 'peer_disconnected', peerID: this.clients_info.get(client)[2]})
                    this.broadcast(roomID, msg)
                    this.clients_info.delete(client)
                }catch{}
            })
        })

        this.set_msg_targets()
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

    set_msg_targets=()=>{ // Setup the target functions of incoming messages
        this.server_socket.on_msg('join_room', (client, json)=>{
            let name=json.name
            if(!name || name=='null')
                name='guest'+this.clients_info.size.toString()
                this.rooms.get(json.roomID).set(client, name)
            this.clients_info.set(client, [name, json.roomID, null])
            const msg=JSON.stringify({target: "participant", name: name, msg: "has entered the room", participants: this.get_participants(json.roomID)})
            this.broadcast(json.roomID, msg)
        })
        this.server_socket.on_msg('chat_msg', (client, json)=>{
            const roomID=this.clients_info.get(client)[1]
            const msg=JSON.stringify({target: 'chat_msg', 'name': this.clients_info.get(client)[0], 'msg': json.msg})
            this.broadcast(roomID, msg)
            // broadcast(`{"target": "msg", "name": "${clients_info.get(client)[0]}", "msg": "${json.msg}"}`) // doesn't work
        })
        this.server_socket.on_msg('uuid', (client, json)=>{
            client.send(JSON.stringify({target: "uuid", uuid: v4()}))
        })
        this.server_socket.on_msg('new_peer', (client, json)=>{
            console.log(`${this.clients_info.get(client)[0]} joined as a peer`)
            this.clients_info.get(client)[2]=json.peerID
            const roomID=this.clients_info.get(client)[1]
            const msg=JSON.stringify({target: 'new_peer', peerID: json.peerID})
            this.broadcast(roomID, msg, client)
        })
    }
}

module.exports={Room_manager}