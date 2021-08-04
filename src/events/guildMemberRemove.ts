import axios from 'axios';
import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { NovaClient } from '../client/NovaClient';
import { EmbedColours } from '../resources/EmbedColours';
import { RunFunction } from '../types/Event';
import { ServerConfig } from '../types/ServerConfig';

export const name: string = 'guildMemberRemove';
export const run: RunFunction = async (client: NovaClient, member: GuildMember) => {
	if (member.user.bot) return;

	const delRes = await axios.delete(`${process.env.API_URL}/users/profile/${member.guild.id}/${member.id}`)
		.catch(err => {
			client.logger.writeError(`Error occured deleting user ${member.id} for guild: ${member.guild.id}.`, err);
		});

	axios.get(`${process.env.API_URL}/config/${member.guild.id}`).then(async res => {
		const config: ServerConfig = res.data;
		if (config.auditChannelId) {
			const auditChannel = await client.channels.fetch(config.auditChannelId)
			const audit = new MessageEmbed()
				.setColor(EmbedColours.negative)
				.setAuthor(member.user.tag, member.user.displayAvatarURL())
				.setDescription('Member left')
				.addField('ID', member.user.id)
				.addField('Member data deleted', delRes && delRes.status === 200)
				.setTimestamp();
			(auditChannel as TextChannel).send(audit);
		}
	}).catch((err) => {
		client.logger.writeError(err);
	});
};
