import axios from "axios";
import { Message } from "discord.js";
import { NovaClient } from "../../client/NovaClient";
import { Command } from "../../types/Command";
import { ServerConfig } from "../../types/ServerConfig";

const run = async (client: NovaClient, message: Message, config: ServerConfig, args: any[]) => {
	config.prefix = args[0];

	axios.patch(`${process.env.API_URL}/config/`, config)
		.catch(() => {
			return message.channel.send('Unable to update prefix due to server error.');
		});
	return message.channel.send(`Prefix updated to '${config.prefix}'.`);
};

const command: Command = {
	name: 'prefix',
	title: 'Set server prefix',
	description: 'Sets the bot command prefix for this server.',
	usage: 'prefix <new prefix>',
	example: 'prefix ~',
	admin: true,
	deleteCmd: false,
	limited: false,
	channels: ['text'],
	run: run
};

export = command;