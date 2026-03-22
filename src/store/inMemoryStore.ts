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
            return "Room Not Found"
        }

        room?.chats.push({
            id: (globalChatId++).toString(),
            userId,
            message,
            roomId,
            upvotes: []
        });
    }

    upvote(roomId: string, chatId: string, userId: UserId){
        const room = this.store.get(roomId);

        if(!room){
            return "Room Not Found"
        }

        const chat = room?.chats.find(x => x.id === chatId);

        if(!chat){
            return "Chat Not Found"
        }

        chat.upvotes.push(userId);

        return "Upvoted SuccessFully"
    }
}