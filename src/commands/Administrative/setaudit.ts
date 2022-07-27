import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { ServerConfig } from '../../client/models/ServerConfig';
import { ConfigManager } from '../../utilities/ConfigManager';

export const execute = async (interaction: ChatInputCommandInteraction, config: ServerConfig): Promise<any> => {
	await ConfigManager.updateChannel(config, interaction, 'auditChannelId');
};

export const data = new SlashCommandBuilder()
	.setName('audit')
	.setDescription('Sets the channel which audits are posted in.')
	.addChannelOption(option =>
		option.setName('channel')
			.setDescription('Channel to post audits in')
			.setRequired(true))
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.setDMPermission(false);
