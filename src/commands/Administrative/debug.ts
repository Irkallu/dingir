import axios from "axios";
import { Message } from "discord.js";
import { NovaClient } from "../../client/NovaClient";
import { Command } from "../../types/Command";
import { ServerConfig } from "../../types/ServerConfig";

const run = async (client: NovaClient, message: Message, config: ServerConfig, args: any[]) => {
	config.debug = !config.debug;

	axios.patch(`${process.env.API_URL}/config/`, config)
		.catch(() => {
			return message.channel.send('Unable to update debug status due to server error.');
		})
		.then(() => {
			if (config.debug) {
				return message.channel.send('Debug mode enabled for errors on this server.');
			} else {
				return message.channel.send('Debug mode disabled for errors on this server.');
			}
		});
};

const command: Command = {
	name: "debug",
	title: 'Toggle Debug',
	description: 'Toggles showing debug messages in this server when errors occur.',
	usage: 'debug',
	example: 'debug',
	admin: true,
	deleteCmd: false,
	limited: false,
	channels: ['text'],
	run: run
};

export = command;