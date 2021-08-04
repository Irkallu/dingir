import axios from 'axios';
import { MessageEmbed, MessageReaction, TextChannel, User } from 'discord.js';
import { NovaClient } from '../client/NovaClient';
import { EmbedColours } from '../resources/EmbedColours';
import { RunFunction } from '../types/Event';
import { ServerConfig } from '../types/ServerConfig';

export const name: string = 'messageReactionAdd';
export const run: RunFunction = async (client: NovaClient, messageReaction: MessageReaction, user: User) => {
	// Get Rules Message
	axios.get(`${process.env.API_URL}/config/${messageReaction.message.guild.id}`).then(async res => {
		const config: ServerConfig = res.data;
		if (config.rulesMessagePath) {
			const str = config.rulesMessagePath.split('/');
			if (messageReaction.partial) {
				await messageReaction.fetch();
			}
			if (messageReaction.message.id === str[1] && messageReaction.emoji.name === '✅') {
				let guestRoles = config.guestRoleIds.split(',');
				messageReaction.message.guild.roles.fetch()
					.then(roles => {
						messageReaction.message.guild.members.fetch(user.id)
							.then(member => {
								if (member.roles.cache.filter(role => role.name !== '@everyone').size === 0)
									member.roles.add(roles.cache.filter(role => guestRoles.includes(role.id)))
										.then(() => {
											if (config.auditChannelId) {
												client.channels.fetch(config.auditChannelId)
													.then(channel => {
														const audit = new MessageEmbed()
															.setColor(EmbedColours.neutral)
															.setAuthor(member.user.tag, member.user.displayAvatarURL())
															.setDescription('Rules accepted by member.')
															.addField('ID', member.user.id)
															.setTimestamp();
														(channel as TextChannel).send(audit);
													}).catch((err) => {
														client.logger.writeError(err);
													});
											}
										})
										.catch(() => {
											if (config.auditChannelId) {
												client.channels.fetch(config.auditChannelId)
													.then(channel => {
														const audit = new MessageEmbed()
															.setColor(EmbedColours.negative)
															.setAuthor(member.user.tag, member.user.displayAvatarURL())
															.setDescription('Unable to provide guest role to user.')
															.addField('ID', member.user.id)
															.setTimestamp();
														(channel as TextChannel).send(audit);
													}).catch((err) => {
														client.logger.writeError(err);
													});
											}
										});
							});
					});
			}
		}
	})
};
