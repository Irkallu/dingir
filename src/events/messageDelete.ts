import { Message, MessageEmbed } from 'discord.js';
import { NovaClient } from '../client/NovaClient';
import { EmbedColours } from '../resources/EmbedColours';
import { RunFunction } from '../types/Event';
import { ChannelService } from '../utilities/ChannelService';
import { ConfigService } from '../utilities/ConfigService';
import { UserProfileService } from '../utilities/UserProfileService';

export const name = 'messageDelete';
export const run: RunFunction = async (client: NovaClient, message: Message) => {
	if (!message.author || !message.guild)
		return;

	const serverConfig = await ConfigService.getConfig(message.guild.id);
	if (message.content.startsWith(serverConfig.prefix)) return;

	UserProfileService.decrementActivityScore(message.guild.id, message.author.id);

	const audit = new MessageEmbed()
		.setColor(EmbedColours.neutral)
		.setAuthor(message.author.tag, message.author.displayAvatarURL())
		.setDescription('A message was deleted')
		.setTimestamp();

	if (message.content)
		audit.addField('Message', message.content);
	if (message.embeds.length > 0)
		audit.addField('Embeds', (message.embeds.length).toString());
	if (message.attachments.size > 0)
		audit.addField('Attachments', (message.attachments.size).toString());

	ChannelService.sendAuditMessage(client, serverConfig, audit);
};
