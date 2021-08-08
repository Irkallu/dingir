import { Message } from 'discord.js';
import { NovaClient } from '../../client/NovaClient';
import { Command } from '../../types/Command';

const run = async (client: NovaClient, message: Message): Promise<any> => {
	const members = message.guild.members.cache.filter(member => 
		member.roles.cache.size === 1
	);

	let response: string;

	if(members.size < 1) {
		response = 'There are no users with no roles.';
	} else {
		response = '**Users with no roles**\n------\n';
		members.each(async (mem) => {
			if (mem.partial)
				await mem.fetch();
			response += `${mem.toString()} joined <t:${Math.floor(mem.joinedTimestamp/1000)}:R>\n`;
		});
	}

	return message.channel.send({ content: response, allowedMentions: { 'parse': []} });
};

const command: Command = {
	name: 'noroles',
	title: 'Users without a role in the server.',
	description: 'Displays how long users with no role have been in the server.',
	usage: 'noroles',
	example: 'noroles',
	admin: true,
	deleteCmd: false,
	limited: false,
	channels: ['GUILD_TEXT'],
	run: run
};

export = command;