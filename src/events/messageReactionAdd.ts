import { MessageEmbed, MessageReaction, User } from 'discord.js';
import { NovaClient } from '../client/NovaClient';
import { EmbedColours } from '../resources/EmbedColours';
import { RunFunction } from '../types/Event';
import { ChannelService } from '../utilities/ChannelService';
import { ConfigService } from '../utilities/ConfigService';

export const name = 'messageReactionAdd';
export const run: RunFunction = async (client: NovaClient, messageReaction: MessageReaction, user: User) => {
	if (!messageReaction.message.guild)
		return;

	const serverConfig = await ConfigService.getConfig(messageReaction.message.guild.id);
	if (!serverConfig || !serverConfig.rulesMessagePath || !serverConfig.guestRoleIds)
		return;
	
	if (messageReaction.partial)
		await messageReaction.fetch();

	const rulesMessage = serverConfig.rulesMessagePath.split('/')[1];

	if (messageReaction.message.id !== rulesMessage || messageReaction.emoji.name !== '✅')
		return;


	const guestRoleIds = serverConfig.guestRoleIds.split(',');
	const guildRoles = await messageReaction.message.guild.roles.fetch();
	const guildMember = await messageReaction.message.guild.members.fetch(user.id);

	if (guildMember.roles.cache.filter(role => role.name !== '@everyone').size > 0)
		return;

	guildMember.roles.add(guildRoles.filter(role => guestRoleIds.includes(role.id)))
		.then(() => {
			const audit = new MessageEmbed()
				.setColor(EmbedColours.neutral)
				.setAuthor(user.tag, user.displayAvatarURL())
				.setDescription('Rules accepted by member.')
				.addField('ID', user.id)
				.setTimestamp();
			return ChannelService.sendAuditMessage(client, serverConfig, audit);
		})
		.catch(() => {
			const audit = new MessageEmbed()
				.setColor(EmbedColours.negative)
				.setAuthor(user.tag, user.displayAvatarURL())
				.setDescription('Unable to provide guest role to user.')
				.addField('ID', user.id)
				.setTimestamp();
			return ChannelService.sendAuditMessage(client, serverConfig, audit);
		});
};
