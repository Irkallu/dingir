import { Message } from "discord.js";
import { NovaClient } from "../../client/NovaClient";
import { Command } from "../../types/Command";
import { ServerConfig } from "../../types/ServerConfig";

const run = async (client: NovaClient, message: Message, config: ServerConfig, args: any[]) => {
	const chan = message.mentions.channels.first();

	if (!chan) {
		return message.channel.send('Channel not found, or I do not have permission to access it.');
	}

	let msg = message.content.slice(config.prefix.length + command.name.length).trim();
	msg = msg.slice(args[0].length).trim();

	let attachments = message.attachments;
	let files = [];

	attachments.forEach(a => {
		files.push(a.url);
	});

	chan.send(msg, {files: files})
		.catch((error) => {
			if (error.message === 'Missing Access') {
				return message.channel.send('I do not have permission to access this channel.');
			} else {
				throw(error);
			}
		});
};

const command: Command = {
	name: 'post',
	title: 'Post to channel',
	description: 'Starts the wizard for adding a todo item to the list for this server.',
	usage: 'post <channel mention> <text>',
	example: 'post #general This is some example text.',
	admin: true,
	deleteCmd: false,
	limited: false,
	channels: ['text'],
	run: run
};

export = command;