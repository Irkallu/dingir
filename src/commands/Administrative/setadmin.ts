import axios from "axios";
import { Message } from "discord.js";
import { NovaClient } from "../../client/NovaClient";
import { Command } from "../../types/Command";
import { ServerConfig } from "../../types/ServerConfig";

const run = async (client: NovaClient, message: Message, config: ServerConfig, args: any[]) => {
	if (config.adminRoleId) {
		if (!message.member.roles.cache.has(config.adminRoleId)) {
			return message.channel.send('You do not have the required permissions for this command.');
		}
	}
	const newRole = message.mentions.roles.first();

	if(args.length === 0 && config.adminRoleId) {
		config.adminRoleId = null;
	} else if (!newRole) {
		return message.channel.send('Role not found, make sure you tagged it correctly.');
	} else {
		config.adminRoleId = newRole.id;
	}

	axios.patch(`${process.env.API_URL}/config/`, config)
		.catch(() => {
			return message.channel.send('Unable to update admin role due to server error.');
		});

	if(config.adminRoleId) {
		return message.channel.send(`Admin role updated to ${newRole.name}.`);
	} else {
		return message.channel.send('Admin role removed.');
	}
};

const command: Command = {
	name: 'setadmin',
	title: 'Set the admin role',
	description: 'Sets the role used for checking if a user can execute admin commands.',
	usage: 'setadmin <role mention>',
	example: 'setadmin @somerole',
	admin: false,
	deleteCmd: false,
	limited: true,
	limitation: 'Can be used by anyone when there is no admin role set for setup purposes.',
	channels: ['text'],
	run: run
};

export = command;