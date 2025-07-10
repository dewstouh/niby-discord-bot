import { Message, UserFlags } from 'discord.js';
import Client from '../../../../../structures/Client';
import { System } from '../../../../../typings/system';

export default {
   execute(client: Client, guildData, userData, deletedMessage: Message) {
      if(client.user?.flags?.has(UserFlags.VerifiedBot)) return; // DONT SAVE SNIPES ON VERIFIED BOTS
      if (deletedMessage.channelId && deletedMessage.author && deletedMessage.content)
         client.snipes.set(deletedMessage.id, {
            messageId: deletedMessage.id,
            channelId: deletedMessage.channelId,
            content: deletedMessage.content || client.translate(guildData.language, `${this.LANG_KEY}.noContent`),
            authorId: deletedMessage.author.id,
            author: deletedMessage.author,
            createdAtTimestamp: deletedMessage.createdTimestamp,
            deletedAtTimestamp: Date.now(),
            attachments: deletedMessage.attachments.map((a) => a.proxyURL),
         });
   },
} as System;
