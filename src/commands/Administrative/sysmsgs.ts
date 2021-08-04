import axios from "axios";
import { Message } from "discord.js";
import { NovaClient } from "../../client/NovaClient";
import { Command } from "../../types/Command";
import { ServerConfig } from "../../types/ServerConfig";

const run = async (client: NovaClient, message: Message, config: ServerConfig, args: any[]) => {
	config.systemMessagesEnabled = !config.systemMessagesEnabled;

	axios.patch(`${process.env.API_URL}/config/`, config)
		.catch(() => {
			return message.channel.send('Unable to toggle system messages due to server error.');
		})
		.then(() => {
			if (config.systemMessagesEnabled) {
				return message.channel.send('System Messages enabled for this server.');
			} else {
				return message.channel.send('System Messages disabled for this server.');
			}
		});
};

const command: Command = {
	name: 'sysmsgs',
	title: 'Toggle System Messages',
	description: 'Toggles sending notifications of user events to the System Messages channel.',
	usage: 'sysmsgs',
	example: 'sysmsgs',
	admin: true,
	deleteCmd: false,
	limited: false,
	channels: ['text'],
	run: run
};

export = command;
