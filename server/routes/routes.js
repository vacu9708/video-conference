const express = require('express');
const Servicer=require("../service/services.js").Servicer
const path=require('path');

class Router{
    constructor(room_manager, express){
        this.servicer=new Servicer(room_manager)
        this.set_routes(express)
    }

    set_routes=(express)=>{
        express.get('/create_room', this.servicer.create_room)
        
        express.get('/*', function(req, res) { // React
            const path_=path.join(__dirname,'../../client/build/index.html')
            res.sendFile(path_, err=>{
                if (err) 
                    res.status(500).send(err)
            })
        })
    }
}

module.exports = {Router}