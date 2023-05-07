const websocket = require('ws');
const {v4} = require('uuid');

class My_websocket{
    constructor(server){
        this.rooms=new Map() // <roomID, Map<room, [client, name]>>
        this.clients_info=new Map() // <client, [name, roomID, peerID]>
        this.connected_ips=new Map() // <IP, bool>
        this.targets=new Map() // <target: string, (client, json)=>void>

        this.server_socket=new websocket.Server({server: server})
        this.server_socket.on('connection', (client, req)=>{
            // Prevent multiple connections from one IP
            if(this.connected_ips.has(req.socket.remoteAddress)){
                client.send(`{"target": "err", "msg": "Existing IP${req.socket.remoteAddress}"}`)
                client.close()
                return
            }
            this.connected_ips.set(req.socket.remoteAddress, true)
    
            client.on('message', (msg)=>{
                const json=JSON.parse(msg)
                if(this.targets.has(json.target))
                    this.targets.get(json.target)(client, json)
            })
        
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
    }

    broadcast(roomID, msg, client=null){
        for(let [member, name] of this.rooms.get(roomID)){
            if(member===client)
                continue
            member.send(msg)
        }
    }
    get_participants(roomID){
        let participants=''
        for(let [member, name] of this.rooms.get(roomID))
            participants+=`${name}, /`
        return participants
    }
    on(target, callback){
        this.targets.set(target, callback)
    }
}

const init=(server)=>{
    const my_ws=new My_websocket(server)
    my_ws.on('join_room', (client, json)=>{
        let name=json.name
        if(!name || name=='null')
            name='guest'+my_ws.clients_info.size.toString()
        my_ws.rooms.get(json.roomID).set(client, name)
        my_ws.clients_info.set(client, [name, json.roomID, null])
        const msg=JSON.stringify({target: "participant", name: name, msg: "has entered the room", participants: my_ws.get_participants(json.roomID)})
        my_ws.broadcast(json.roomID, msg)
    })
    my_ws.on('chat_msg', (client, json)=>{
        const roomID=my_ws.clients_info.get(client)[1]
        const msg=JSON.stringify({target: 'chat_msg', 'name': my_ws.clients_info.get(client)[0], 'msg': json.msg})
        my_ws.broadcast(roomID, msg)
        // broadcast(`{"target": "msg", "name": "${clients_info.get(client)[0]}", "msg": "${json.msg}"}`) // doesn't work
    })
    my_ws.on('uuid', (client, json)=>{
        client.send(JSON.stringify({target: "uuid", uuid: v4()}))
    })
    my_ws.on('new_peer', (client, json)=>{
        console.log(`${my_ws.clients_info.get(client)[0]} joined as a peer`)
        my_ws.clients_info.get(client)[2]=json.peerID
        const roomID=my_ws.clients_info.get(client)[1]
        const msg=JSON.stringify({target: 'new_peer', peerID: json.peerID})
        my_ws.broadcast(roomID, msg, client)
    })
    return my_ws
}

module.exports={init}