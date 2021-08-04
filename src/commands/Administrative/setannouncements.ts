import axios from "axios";
import { Message } from "discord.js";
import { NovaClient } from "../../client/NovaClient";
import { Command } from "../../types/Command";
import { ServerConfig } from "../../types/ServerConfig";

const run = async (client: NovaClient, message: Message, config: ServerConfig, args: any[]) => {
	const chan = message.mentions.channels.first();

	if(args.length === 0 && config.announcementsChannelId) {
		config.announcementsChannelId = null;
	} else if (!chan) {
		return message.channel.send('Channel not found, or I do not have permission to access it.');
	} else {
		config.announcementsChannelId = chan.id;
	}

	config.announcementsChannelId = chan.id;

	axios.patch(`${process.env.API_URL}/config/`, config)
		.catch(() => {
			return message.channel.send('Unable to update announcements channel due to server error.');
		});

	if (config.announcementsChannelId) {
		return message.channel.send(`Announcements channel updated to ${chan.name}.`);
	} else {
		return message.channel.send('Announcements to channel disabled.');
	}

};

const command: Command = {
	name: 'setannouncements',
	title: 'Set the announcements channel',
	description: 'Sets the channel where the bot posts announcements.',
	usage: 'setannouncements <channel mention>',
	example: 'setannouncements #general',
	admin: true,
	deleteCmd: false,
	limited: false,
	channels: ['text'],
	run: run
};

export = command;