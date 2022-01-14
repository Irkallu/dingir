import { GuildMember, MessageEmbed } from 'discord.js';
import { NovaClient } from '../client/NovaClient';
import { RunFunction } from '../types/Event';
import { EmbedColours } from '../resources/EmbedColours';
import { ChannelService } from '../utilities/ChannelService';
import { ConfigService } from '../utilities/ConfigService';

export const name = 'guildMemberAdd';
export const run: RunFunction = async (client: NovaClient, member: GuildMember) => {
	const serverConfig = await ConfigService.getConfig(member.guild.id);

	const audit = new MessageEmbed()
		.setColor(EmbedColours.positive)
		.setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
		.setDescription('New member joined')
		.addField('ID', member.user.id)
		.setTimestamp();
				
	ChannelService.sendAuditMessage(client, serverConfig, audit);
};
