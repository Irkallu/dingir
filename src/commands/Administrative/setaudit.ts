import axios from "axios";
import { Message } from "discord.js";
import { NovaClient } from "../../client/NovaClient";
import { Command } from "../../types/Command";
import { ServerConfig } from "../../types/ServerConfig";

const run = async (client: NovaClient, message: Message, config: ServerConfig, args: any[]) => {
	const chan = message.mentions.channels.first();

	if(args.length === 0 && config.auditChannelId) {
		config.auditChannelId = null;
	} else if (!chan) {
		return message.channel.send('Channel not found, or I do not have permission to access it.');
	} else {
		config.auditChannelId = chan.id;
	}

	config.auditChannelId = chan.id;

	axios.patch(`${process.env.API_URL}/config/`, config)
		.catch(() => {
			return message.channel.send('Unable to update audit channel due to server error.');
		});

	if(config.auditChannelId) {
		return message.channel.send(`Audit channel updated to ${chan.name}.`);
	} else {
		return message.channel.send('Auditing to channel disabled.');
	}

};

const command: Command = {
	name: 'setaudit',
	title: 'Set the audit channel',
	description: 'Sets the channel where the bot posts audit logs.',
	usage: 'setaudit <channel mention>',
	example: 'setaudit #general',
	admin: true,
	deleteCmd: false,
	limited: false,
	channels: ['text'],
	run: run
};

export = command;
