const {v4} = require('uuid');

let server_socket
const init=(server_socket_)=>{
    server_socket=server_socket_
}

const create_room=(req, res) => {
    const uuid=v4()
    server_socket.rooms.set(uuid, new Map())
    return res.status(200).end(uuid)
}

module.exports={create_room, init}