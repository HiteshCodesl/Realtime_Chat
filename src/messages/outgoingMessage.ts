
export enum SupportedMessage {
    addChat = 'ADD_CHAT',
    updateChat = 'UPDATE_CHAT'
}

export type messagePayload = {
    roomId: string;
    userId: string;
    upvotes: number;
    message: string;
    chatId: string;
}

export type OutGoingMessage = {
    type: SupportedMessage.addChat,
    payload: messagePayload
} | {
    type: SupportedMessage.updateChat,
    payload: Partial<messagePayload>
}