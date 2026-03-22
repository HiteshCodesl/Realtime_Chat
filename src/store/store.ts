
export type UserId = string;

export interface Chat{
  id: string;
  userId: string;
  message: string;
  roomId: string;
  upvotes: UserId[];
}


export abstract class Store{
    constructor(){

    }

    initRoom(roomId: string){

    }

    getChats(roomId: string, limit: number, offset: number){

    }

    addChat(roomId: string, userId: UserId, message: string){

    }

    upvote(roomId: string, chatId: string, userId: UserId){

    }
}