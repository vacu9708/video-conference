const {v4} = require('uuid');

class Servicer{
    constructor(room_manager){
        this.room_manager=room_manager
    }

    create_room = (req, res)=>{
        const uuid=v4()
        this.room_manager.rooms.set(uuid, new Map())
        return res.status(200).end(uuid)
    }
}

module.exports={Servicer}