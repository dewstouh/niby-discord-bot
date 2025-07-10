import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Embed } from "../../../extenders/discord/Embed";
import { Command } from "../../../structures/Command";

export default {
    ALIASES: ["invitar", "botinvite", "invitebot"],
    execute(client, message, args, prefix, guildData) {
        message.reply({
            embeds: [
                new Embed()
                    .addField(
                        client.utils.locale.inlineLocale(guildData.language, `${this.LANG_KEY}.embed.name`),
                        client.utils.locale.inlineLocale(guildData.language, `${this.LANG_KEY}.embed.value`, {invite: client.invite})
                    )
            ],
            ephemeral: true,
            components: [
                new ActionRowBuilder().addComponents([
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        .setURL(client.invite)
                        .setEmoji(client.allemojis.yes)
                        .setLabel(client.utils.locale.inlineLocale(guildData.language, `${this.LANG_KEY}.button.invite`)),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        .setURL(process.env.DISCORD)
                        .setEmoji(client.allemojis.discord)
                        .setLabel(client.utils.locale.inlineLocale(guildData.language, `${this.LANG_KEY}.button.support`)),
                ])
            ]
        });
    }
} as Command;
