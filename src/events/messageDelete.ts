import axios from 'axios';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { NovaClient } from '../client/NovaClient';
import { EmbedColours } from '../resources/EmbedColours';
import { RunFunction } from '../types/Event';
import { ServerConfig } from '../types/ServerConfig';

export const name: string = 'messageDelete';
export const run: RunFunction = async (client: NovaClient, message: Message) => {
	if (!message.author || !message.guild)
		return;

	const res = await axios.get(`${process.env.API_URL}/config/${message.guild.id}`);
	const config: ServerConfig = res.data;
	if (message.content.startsWith(config.prefix)) return;

	await axios.patch(`${process.env.API_URL}/users/profile/${message.guild.id}/${message.author.id}/messages/decrement`);

	if (config.auditChannelId) {
		const channel = await client.channels.fetch(config.auditChannelId).catch(err => {
			return client.logger.writeError(`Couldn't fetch audit channel for ${message.guild.id}: ${err}`);
		});
		const audit = new MessageEmbed()
			.setColor(EmbedColours.neutral)
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setDescription('A message was deleted')
			.setTimestamp();

		if (message.content)
			audit.addField('Message', message.content);
		if (message.embeds)
			audit.addField('Embeds', message.embeds.length);

		(channel as TextChannel).send(audit);
	}
};
