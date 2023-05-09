const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http');
const https = require('https');
const routes=require("./routes/routes.js");
const socket=require("./socket.js");
const path=require('path')

app.use(express.json()); // to accept json data
//app.use(express.static(__dirname))
const react_path=path.join(__dirname,'../client/build')
app.use(express.static(react_path))

app.use('/', routes.router)

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
  console.log('server running on1 '+port)
});

const server_socket=socket.init(server)
routes.init(server_socket)