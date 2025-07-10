import { inspect } from 'util';
import { Embed, ErrorEmbed } from '../../extenders/discord/Embed';
import { Command } from '../../structures/Command';
import Client from '../../structures/Client';
export default {
	OPTIONS: [
		{
			STRING: {
				REQUIRED: true,
			},
		},
	],
	USAGE: '<codigo>',
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async execute(client:Client, message, args, prefix, guildData, userData, player) {
		if (!args.length)
			return message.reply({
				embeds: [
					new ErrorEmbed().addField(
						client.translate(guildData.language, `${this.LANG_KEY}.noargs.name`, {
							noEmoji: client.allemojis.no,
						}),
						client.translate(guildData.language, `${this.LANG_KEY}.noargs.value`, {
							cmdName: this.NAME,
							prefix,
						}),
					),
				],
				ephemeral: true,
			});

		const codeToEval = args.join(' ');

		const BEFORE_EVAL = Date.now();

		const loadingMsg = await message.reply({
			embeds: [
				new Embed()
				.addField(
					client.translate(guildData.language, `${this.LANG_KEY}.loading.name`),
					client.translate(guildData.language, `${this.LANG_KEY}.loading.value`),
				)
			]
		})

		try {

			const INPUT = codeToEval.includes('await')
				? await eval(`(async () => {${codeToEval}})()`)
				: await eval(codeToEval);
			const STRING_MSG = censorEnvVariables(String(inspect(INPUT)));
			const AFTER_EVAL = Math.abs(Date.now() - BEFORE_EVAL);
			const OUTPUT = STRING_MSG.length > 1000 ? `${STRING_MSG.substring(0, 1000)}...` : STRING_MSG;
			let outputUrl = "";
			if (STRING_MSG.length > 1000) {
				outputUrl = await client.utils.nibybin.create({
					title: client.translate(guildData.language, `${this.LANG_KEY}.eval.title`, {
						clientTag: client.user?.tag,
					}), // `Evaluación de ${client.user.tag}`,
					description: `${args.join(' ')}`,
               language: 'javascript',
               code: STRING_MSG
				})
					.then((x) => x.url)
					.catch(() => client.translate(guildData.language, `${this.LANG_KEY}.error.noLink`));
			}

			return client.utils.message.edit(message, loadingMsg, {
				embeds: [
					new Embed()
						.setDescription(
							client.translate(guildData.language, `${this.LANG_KEY}.eval.outputUri`, {
								outputUrl: outputUrl ? `[\`NibyBin\`](${outputUrl})` : `\`${client.translate(guildData.language, `${this.LANG_KEY}.noOutput`)}\``,
							}),
						)
						.addFields([
							{
								name: client.translate(guildData.language, `${this.LANG_KEY}.eval.inputText`),
								value: `\`\`\`js\n${args.join(' ')}\`\`\``,
							},
							{
								name: client.translate(guildData.language, `${this.LANG_KEY}.eval.outputText`),
								value: `\`\`\`js\n${OUTPUT}\`\`\``,
							},
						])
						.setFooter({
							text: client.translate(guildData.language, `${this.LANG_KEY}.eval.ms`, {
								evalMs: `${AFTER_EVAL}ms`,
							}),
						}),
				],
				ephemeral: true,
			});

		} catch (e) {
			// Console.error(e)
			const STRING_MSG = censorEnvVariables(String(e));
			const OUTPUT = STRING_MSG.length > 1000 ? `${STRING_MSG.substring(0, 1000)}...` : STRING_MSG;
			let outputUrl = "";
			if (STRING_MSG.length > 1000) {
				outputUrl = await client.utils.nibybin.create({
					title: client.translate(guildData.language, `${this.LANG_KEY}.eval.title`, {
						clientTag: client.user?.tag,
					}), // `Evaluación de ${client.user.tag}`,
					description: `${args.join(' ')}`,
               language: 'javascript',
               code: STRING_MSG
				})
					.then((x) => x.url)
					.catch(() => client.translate(guildData.language, `${this.LANG_KEY}.error.noLink`));
			}

			return client.utils.message.edit(message, loadingMsg, {
				embeds: [
					new ErrorEmbed()
						.setDescription(
							client.translate(guildData.language, `${this.LANG_KEY}.eval.outputUri`, {
								outputUrl: outputUrl ? `[\`NibyBin\`](${outputUrl})` : `\`${client.translate(guildData.language, `${this.LANG_KEY}.noOutput`)}\``,
							}),
						)
						.addFields([
							{
								name: client.translate(guildData.language, `${this.LANG_KEY}.eval.inputText`),
								value: `\`\`\`js\n${args.join(' ')}\`\`\``,
							},
							{
								name: client.translate(guildData.language, `${this.LANG_KEY}.eval.outputText`),
								value: `\`\`\`js\n${OUTPUT}\`\`\``,
							},
						])
						.setFooter({
							text: client.translate(guildData.language, `${this.LANG_KEY}.eval.error`),
						}),
				],
				ephemeral: true,
			});
		}

		function censorEnvVariables(text) {
			let modified = text;
			const envArray = Object.values(process.env);

			const filterOnly = [process.env.BOT_TOKEN, process.env.MONGO_URL, process.env.REDIS_URL];

			envArray
				.filter((tokens) => filterOnly.includes(tokens))
				.forEach((value) => {
					// Utiliza una expresión regular con escape para reemplazar todas las apariciones de la variable de entorno
					modified = modified.replace(
						new RegExp(value!.escape(), 'g'),
						'*'.repeat(value!.length),
					);
				});

			return modified;
		}
	},
} as Command;
