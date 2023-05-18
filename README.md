# Frontend
React, Typescript
# Backend
- Express.js
- HTTPS connection for secure video call
- Websocket: for real-time chat, broker of webRTC
- WebRTC: for real-time video, audio streaming
# other tools
- Docker
- AWS EC2
- Jenkins

# Architecture
### CI/CD
![image](https://github.com/vacu9708/video-conference/assets/67142421/95e6b781-56ac-488f-aaa3-82f98e556b06)<br>
### Modules
![image](https://github.com/vacu9708/video-conference/assets/67142421/13e663ee-e3cb-421e-93ef-4d89d6d7809b)<br>

At first, clients do not know where they are. User2's information is sent to User1 through the signaling server to establish a direct peer to peer connection between clients.<br>
![image](https://github.com/vacu9708/video-conference/assets/67142421/c13a5feb-39b0-4852-a745-44c3f9bbd38d)<br>

# WebRTC and Websocket
![image](https://github.com/vacu9708/video-conference/assets/67142421/ef40bb16-f8a0-4c98-8f1b-9b20d589bbac)

# Page for creating a conference room
![image](https://github.com/vacu9708/video-conference/assets/67142421/f52e20b6-92ee-43cd-904e-822bef206e13)

# Conference room
![image](https://user-images.githubusercontent.com/67142421/205711740-6953fe9b-8180-4f71-ad41-c967d2c968e9.png)

# Future plan
- Add login/registration page to store the nickname.
- Only authenticated clients can create one room(one room per socket)
- If the room creater exists, the room is closed
