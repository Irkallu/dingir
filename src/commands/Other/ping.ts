import { ChannelType, Message } from 'discord.js';
import { NovaClient } from '../../client/NovaClient';
import { Command } from '../../types/Command';

const run = async (client: NovaClient, message: Message): Promise<any> => {
	message.channel.send('Pong!');
};

const command: Command = {
	name: 'ping',
	title: 'Ping',
	description: 'Ping Pong command (Useful for testing too!).',
	usage: 'ping',
	example: 'ping',
	admin: false,
	deleteCmd: false,
	limited: false,
	channels: [ChannelType.GuildText, ChannelType.DM],
	run: run
};

export = command;
