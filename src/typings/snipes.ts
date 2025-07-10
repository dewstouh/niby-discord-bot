import { User } from "discord.js";

export type Snipe = {
    messageId:string,
    channelId:string,
    content:string,
    authorId:string,
    author:User,
    createdAtTimestamp:number,
    deletedAtTimestamp:number,
    attachments: string[],
}