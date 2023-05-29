# Frontend
React, Typescript
# Backend
- Express.js
- HTTPs connection for secure video call
- Websocket: for real-time chat, broker of webRTC
# Peer-to-peer real time communication through webRTC
- used the native javascript API
- Multiple connections more than 2 peers can be established
# others
- Docker
- AWS EC2
- Jenkins

# Conference room
![image](https://user-images.githubusercontent.com/67142421/205711740-6953fe9b-8180-4f71-ad41-c967d2c968e9.png)

# Architecture
### CI/CD
![image](https://github.com/vacu9708/video-conference/assets/67142421/95e6b781-56ac-488f-aaa3-82f98e556b06)<br>
### Modules
![image](https://github.com/vacu9708/video-conference/assets/67142421/13e663ee-e3cb-421e-93ef-4d89d6d7809b)<br>
### WebRTC process
At first, clients do not know where they are. User2's information is sent to User1 through the signaling server to establish a direct peer to peer connection between clients.<br>
The STUN server enables clients to find out their public IP address.<br>
![image](https://github.com/vacu9708/video-conference/assets/67142421/2b272e18-0118-4457-a3b6-61fcaaf16d12)

# ICE (Interactive Connectivity Establishment)
In WebRTC, the ICE process involves the exchange of ICE candidates between peers to establish a direct peer-to-peer connection.<br>
ICE candidates contain network information, such as IP addresses and port numbers, that are used to discover and establish communication paths.<br>
The ICE candidate gathering process is initiated automatically by the WebRTC implementation when the connection is being established.
### Multiple ICE candidates
Multiple ICE candidates may be generated for a single peer because they represent different potential communication paths.<br>
The purpose of having multiple candidates is to increase the chances of successfully establishing a direct peer-to-peer connection, especially in scenarios where one or both peers are behind NAT (Network Address Translation) devices or firewalls.

# WebRTC and Websocket
![image](https://github.com/vacu9708/video-conference/assets/67142421/ef40bb16-f8a0-4c98-8f1b-9b20d589bbac)

# Future plan
- Deprecate node.js code and rewrite all the code in spring boot
- Add login/registration page to store the nickname.
- Think about preventing CSRF, XSS attacks
