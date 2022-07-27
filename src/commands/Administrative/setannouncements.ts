import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { ServerConfig } from '../../client/models/ServerConfig';
import { ConfigManager } from '../../utilities/ConfigManager';

export const execute = async (interaction: ChatInputCommandInteraction, config: ServerConfig): Promise<any> => {
	await ConfigManager.updateChannel(config, interaction, 'announcementsChannelId');
};

export const data = new SlashCommandBuilder()
	.setName('announcements')
	.setDescription('Sets the channel which announcements are posted in.')
	.addChannelOption(option => 
		option.setName('channel')
			.setDescription('Channel to post announcements in')
			.setRequired(true))
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.setDMPermission(false);
