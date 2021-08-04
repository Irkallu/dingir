import { Command } from '../../types/Command'
import { Message, MessageEmbed } from 'discord.js';
import { EmbedColours } from '../../resources/EmbedColours';
import { CommandAccess } from '../../utilities/CommandAccess';
import { NovaClient } from '../../client/NovaClient';
import { ServerConfig } from '../../types/ServerConfig';

const run = async (client: NovaClient, message: Message, config: ServerConfig, args: any[]) => {
	const embed = new MessageEmbed()
		.setThumbnail((client.user.displayAvatarURL()))
		.setTitle('Commands List')
		.setColor(EmbedColours.info)
		.setTimestamp();

	client.commands.forEach((cmd: Command) => {
		const commandAccess = new CommandAccess();
		const access = commandAccess.verifyAccess(cmd, message, config);
		if (access.hasAccess)
			embed.addField(config ? config.prefix + cmd.usage : cmd.usage, cmd.description);
	});

	return message.channel.send(embed);
};

const command: Command = {
	name: 'commands',
	title: 'Commands List',
	description: 'Shows a list of bot commands and help text.',
	usage: 'commands',
	example: 'commands',
	admin: false,
	deleteCmd: false,
	limited: false,
	channels: ['text', 'dm'],
	run: run
};

export = command;