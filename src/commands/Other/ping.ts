import { Message } from 'discord.js';
import { NovaClient } from '../../client/NovaClient';
import { Command } from '../../types/Command'
import { ServerConfig } from '../../types/ServerConfig';

const run = async (client: NovaClient, message: Message, config: ServerConfig, args: any[]) => {
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
	channels: ['text', 'dm'],
	run: run
}

export = command;
