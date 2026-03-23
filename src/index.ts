import {connection, server as WebSocketServer} from 'websocket'
import http from 'http';
import { UserManager } from './userManger.js';
import { InMemoryStore } from './store/inMemoryStore.js';
import { SupportedIncomingMessage, type IncomingMessageType } from './messages/incomingMessage.js';
import { messagePayload, OutGoingMessage, SupportedMessage } from './messages/outgoingMessage.js';

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});


const userManager = new UserManager();
const storeManager = new InMemoryStore();

const wsServer = new WebSocketServer({
    httpServer: server,
});


function originIsAllowed(origin: string) {
   
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {

      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            try{
                messageHandler(connection, JSON.parse(message.utf8Data) )
            }catch(e){
                
            }
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

function messageHandler(socket: connection, message: IncomingMessageType){
    if(message.type === SupportedIncomingMessage.JoinRoom){
        const payload = message.payload;
        userManager.addUser(payload.userId , payload.name, payload.roomId, socket)
    }

    if(message.type === SupportedIncomingMessage.SendMessage){
        const payload = message.payload;

        const user = userManager.getUser(payload.userId, payload.roomId);

        if(!user){
            console.error("User Not Found in the Room");
            return;
        }

        let chat = storeManager.addChat(payload.roomId, user.id, payload.message)

        if(!chat){
            return null;
        }

        const outgoingPayloadMessage: OutGoingMessage = {
           type: SupportedMessage.addChat,
           payload: {
            chatId: chat.id,
            roomId: payload.roomId,
            message: payload.message,
            upvotes: 0,
            userId: payload.userId
           }
        }
        
        userManager.broadCast(payload.roomId, outgoingPayloadMessage, payload.userId)
    }

    if(message.type === SupportedIncomingMessage.UpvoteMessage){
        const payload = message.payload;
        
        const chat = storeManager.upvote(payload.roomId, payload.chatId, payload.userId)

        if(!chat){
            return;
        }

        const outgoingPayloadMessage: OutGoingMessage = {
            type: SupportedMessage.updateChat,
            payload: {
                chatId: payload.chatId,
                roomId: payload.roomId, 
                upvotes: chat.upvotes.length,
            }
        }
         userManager.broadCast(payload.roomId, outgoingPayloadMessage, payload.userId )
    }
}