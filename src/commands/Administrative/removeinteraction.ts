import { Message, TextChannel } from 'discord.js';
import { NovaClient } from '../../client/NovaClient';
import { Command } from '../../types/Command';
import { ServerConfig } from '../../types/ServerConfig';
import { ConfigService } from '../../utilities/ConfigService';

const run = async (client: NovaClient, message: Message, config: ServerConfig): Promise<any> => {
	const [channelId, msgId] = config.rulesMessagePath.split('/');

	const chan = await client.channels.fetch(channelId);
	const msg = await (chan as TextChannel).messages.fetch(msgId);

	msg.edit({ content: msg.content, components: [] });
};

const command: Command = {
	name: 'removeinteraction',
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