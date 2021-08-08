import { Message } from 'discord.js';
import { NovaClient } from '../../client/NovaClient';
import { Command } from '../../types/Command';
import { ServerConfig } from '../../types/ServerConfig';
import { ConfigService } from '../../utilities/ConfigService';

const run = async (client: NovaClient, message: Message, config: ServerConfig): Promise<any> => {
	config.debug = !config.debug;

	const updated: boolean = await ConfigService.updateConfig(config, message);

	if (updated)
		return message.channel.send({ content: `Debug mode ${config.debug ? 'enabled' : 'disabled'} for ${message.guild.name}.`});
};

const command: Command = {
	name: 'debug',
	title: 'Toggle Debug',
	description: 'Toggles showing debug messages in this server when errors occur.',
	usage: 'debug',
	example: 'debug',
	admin: true,
	deleteCmd: false,
	limited: false,
	channels: ['GUILD_TEXT'],
	run: run
};

export = command;