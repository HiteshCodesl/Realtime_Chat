import z from "zod"

export enum SupportedMessage {
    JoinRoom = "JOIN_ROOM",
    SendMessage = "CHAT_MESSAGE",
    UpvoteMessage = "UPVOTE_MESSAGE"
}

export type IncomingMessageType = {
    type: SupportedMessage.JoinRoom,
    payload: initMessageType
} | {
    type: SupportedMessage.SendMessage,
    payload: userMessageType
} | {
    type: SupportedMessage.UpvoteMessage,
    payload: upvoteMessageType
}

export const initMessage = z.object({
    userId: z.string(),
    roomId: z.string(),
    name: z.string()
})

type initMessageType =  z.infer<typeof initMessage>;

export const userMessage = z.object({
    userId: z.string(),
    roomId: z.string(),
    message: z.string()
})

type userMessageType =  z.infer<typeof userMessage>;

export const upvoteMessage = z.object({
    userId: z.string(),
    chatId: z.string(),
    roomId: z.string()
})

type upvoteMessageType =  z.infer<typeof upvoteMessage>;


