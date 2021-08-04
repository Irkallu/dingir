import axios from 'axios';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { NovaClient } from '../client/NovaClient';
import { EmbedColours } from '../resources/EmbedColours';
import { RunFunction } from '../types/Event';
import { ServerConfig } from '../types/ServerConfig';

export const name: string = 'messageUpdate';
export const run: RunFunction = async (client: NovaClient, oldMessage: Message, newMessage: Message) => {
	if (!oldMessage.content)
		return;

	if (newMessage.partial) {
		newMessage = await newMessage.fetch();
	}

	if (newMessage.author.bot || !newMessage.guild) return;

	if (oldMessage.content === newMessage.content) return;

	const res = await axios.get(`${process.env.API_URL}/config/${newMessage.guild.id}`);
	const config: ServerConfig = res.data;
	if (config.auditChannelId) {
		const channel = await client.channels.fetch(config.auditChannelId).catch(err => {
			return client.logger.writeError(`Couldn't fetch audit channel for ${newMessage.guild.id}: ${err}`);
		});
		const audit = new MessageEmbed()
			.setColor(EmbedColours.neutral)
			.setAuthor(newMessage.author.tag, newMessage.author.displayAvatarURL())
			.setDescription('A message was edited')
			.addField('Previous', oldMessage.content)
			.addField('Current', newMessage.content)
			.setTimestamp();
		(channel as TextChannel).send(audit);
	}
};
