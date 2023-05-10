const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http');
const https = require('https');
const Router=require("./routes/routes.js").Router;
const Room_manager=require("./Room_manager.js").Room_manager;
const path=require('path')

app.use(express.json()); // to accept json data
//app.use(express.static(__dirname))
const react_path=path.join(__dirname,'../client/build')
app.use(express.static(react_path))


const options = { 
  key: fs.readFileSync('./keys/privkey.pem'),
  cert: fs.readFileSync('./keys/fullchain.pem'),
}
// const server = http.createServer(app);
const server = https.createServer(options, app);
const port = process.env.PORT || 443
server.listen(port, (err) => {
  if (err) 
    return console.log(err);
  console.log('server running on '+port)
});

const room_manager=new Room_manager(server)
const router=new Router(room_manager, app)