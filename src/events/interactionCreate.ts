import { Interaction, MessageEmbed } from 'discord.js';
import { NovaClient } from '../client/NovaClient';
import { EmbedColours } from '../resources/EmbedColours';
import { RunFunction } from '../types/Event';
import { ChannelService } from '../utilities/ChannelService';
import { ConfigService } from '../utilities/ConfigService';

export const name = 'interactionCreate';
export const run: RunFunction = async (client: NovaClient, interaction: Interaction) => {
	if (!interaction.guild || !interaction.isButton() || !interaction.isMessageComponent())
		return;

	const serverConfig = await ConfigService.getConfig(interaction.guild.id);
	if (!serverConfig || !serverConfig.rulesMessagePath || !serverConfig.guestRoleIds)
		return;

	const rulesMessage = serverConfig.rulesMessagePath.split('/')[1];

	if (interaction.message.id !== rulesMessage)
		return;


	const guestRoleIds = serverConfig.guestRoleIds.split(',');
	const guildRoles = await interaction.guild.roles.fetch();
	const guildMember = await interaction.guild.members.fetch(interaction.user.id);

	if (guildMember.roles.cache.filter(role => role.name !== '@everyone').size > 0)
		return interaction.reply({  content: 'It looks like you already have roles in this server!', ephemeral: true });

	guildMember.roles.add(guildRoles.filter(role => guestRoleIds.includes(role.id)))
		.then(() => {
			interaction.reply({  content: 'Thank you for accepting our rules!', ephemeral: true });

			const audit = new MessageEmbed()
				.setColor(EmbedColours.neutral)
				.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
				.setDescription('Rules accepted by member.')
				.addField('ID', interaction.user.id)
				.setTimestamp();
			return ChannelService.sendAuditMessage(client, serverConfig, audit);
		})
		.catch(() => {
			const audit = new MessageEmbed()
				.setColor(EmbedColours.negative)
				.setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
				.setDescription('Unable to provide guest role to user.')
				.addField('ID', interaction.user.id)
				.setTimestamp();
			return ChannelService.sendAuditMessage(client, serverConfig, audit);
		});
};
