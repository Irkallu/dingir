import { Message } from "discord.js";
import { NovaClient } from "../../client/NovaClient";
import { Command } from "../../types/Command";
import { ServerConfig } from "../../types/ServerConfig";

const run = async (client: NovaClient, message: Message, config: ServerConfig, args: any[]) => {
	let mem = message.mentions.members.first() ?? message.member;

	client.emit('guildMemberAdd', mem);
};

const command: Command = {
	name: 'testjoin',
	title: 'Trigger a user join event',
	description: 'Fires the event for guildMemberAdd as mentioned user, or the current user if not provided.',
	usage: 'testjoin',
	example: 'testjoin',
	admin: true,
	deleteCmd: false,
	limited: false,
	channels: ['text'],
	run: run
};

export = command;