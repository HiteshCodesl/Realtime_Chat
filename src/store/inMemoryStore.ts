import { messagePayload } from "../messages/outgoingMessage.js";
import { Store, type Chat, type UserId } from "./store.js";

export let globalChatId: number = 1;

interface Room{
    roomId: string;
    chats: Chat[];
}

export class InMemoryStore implements Store{
    private store: Map<string, Room>;

    constructor(){
      this.store = new Map<string, Room>;
    }

    initRoom(roomId: string){
       this.store.set(roomId, {
        roomId: roomId,
        chats: []
       })
    }

    getChats(roomId: string, limit: number, offset: number){
        const room = this.store.get(roomId);
        if(!room){
          return [];
        }

        const chats = room?.chats.reverse().slice(offset); // 50 chat drop then  50 should append

        return chats;
    }

    addChat(roomId: string, userId: string, message: string){
        const room = this.store.get(roomId);

        if(!room){
            return;
        }

        const chat = {
            id: (globalChatId++).toString(),
            userId,
            message,
            roomId,
            upvotes: []
        };

        room.chats.push(chat);

        return chat;
    }

    upvote(roomId: string, chatId: string, userId: UserId){
        const room = this.store.get(roomId);

        if(!room){
            return;
        }

        const chat = room.chats.find(x => x.id === chatId);

        if(chat){
           chat.upvotes.push(userId);
        }
        
        return chat;
    }
}