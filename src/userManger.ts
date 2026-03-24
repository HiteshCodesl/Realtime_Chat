import type { connection } from "websocket";
import { OutGoingMessage, SupportedMessage } from "./messages/outgoingMessage.js";

interface User{
    id: string,
    name: string,
    socket: connection
}

interface Room{
    users: User[];
}

export class UserManager{
    private rooms: Map<string, Room>;

    constructor(){
        this.rooms = new Map<string, Room>;
    }

    addUser(userId: string, name: string, roomId: string, socket: connection){
        if(!this.rooms.get(roomId)){
            this.rooms.set(roomId, {
                users: []
            })
        }

        this.rooms.get(roomId)?.users.push({
            id: userId,
            name,
            socket
        })
    }

    removeUser(userId: string, roomId: string){
        const room = this.rooms.get(roomId);

        if(room){
            room.users.filter(x => x.id !== userId);
        }
    }
         
    getUser(userId: string, roomId: string): User | null{
        const user = this.rooms.get(roomId)?.users.find((x) => x.id === userId);
        return user ?? null;
    }

    broadCast(roomId: string, message: OutGoingMessage, userId: string){
        const user = this.getUser(userId, roomId);
        console.log("Inside broadcast message", message);
        if(!user){
            console.error("User Was Not Found");
            return;
        }

        const room = this.rooms.get(roomId);

        if(!room){
            console.error("Room Not Found");
           return;
        }

        room.users.forEach((u) => {
            u.socket.send(JSON.stringify(message));
        })
    } 
}