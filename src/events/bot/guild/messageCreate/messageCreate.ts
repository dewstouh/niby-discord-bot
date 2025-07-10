
import { MessageCMDHandler } from '../../../../handlers/CommandHandler';
import Client from '../../../../structures/Client';
export default async (client:Client, message) => {
	if ((message.guildId && !message.guild) || message.author.bot || !message.channel) return;
	message.user = message.author ?? (await client.users.fetch(message.author.id).catch(() => null));
	// message.member = message.member ?? await message.guild.members.fetch(message.author.id).catch(() => null);
	return MessageCMDHandler(client, message);
};
