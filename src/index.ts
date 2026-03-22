import {connection, server as WebSocketServer} from 'websocket'
import http, { IncomingMessage } from 'http';
import { UserManager } from './userManger.js';
import { InMemoryStore } from './store/inMemoryStore.js';
import { SupportedMessage, type IncomingMessageType } from './message.js';

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
    autoAcceptConnections: false
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
    if(message.type === SupportedMessage.JoinRoom){
        const payload = message.payload;
        userManager.addUser(payload.userId , payload.name, payload.roomId, socket)
    }

    if(message.type === SupportedMessage.SendMessage){
        const payload = message.payload;

        const user = userManager.getUser(payload.userId, payload.roomId);

        if(!user){
            console.error("User Not Found in the Room");
            return;
        }

        storeManager.addChat(payload.roomId, user.id, payload.message)
    }

    if(message.type === SupportedMessage.UpvoteMessage){
        const payload = message.payload;
        storeManager.upvote(payload.roomId, payload.chatId, payload.userId)
    }
}