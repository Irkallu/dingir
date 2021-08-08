import { Message, MessageEmbed } from 'discord.js';
import { NovaClient } from '../../client/NovaClient';
import { EmbedColours } from '../../resources/EmbedColours';
import { Command } from '../../types/Command';
import { ServerConfig } from '../../types/ServerConfig';
import { ChannelService } from '../../utilities/ChannelService';
import { ConfigService } from '../../utilities/ConfigService';

const run = async (client: NovaClient, message: Message, config: ServerConfig): Promise<any> => {
	const newWelcome = message.content.slice(config.prefix.length + command.name.length).trim();

	if (newWelcome.length < 1) {
		if (config.welcomeMessage){
			return message.channel.send(`**Current Welcome Message**\n${config.welcomeMessage}`);
		} else {
			return message.channel.send('Welcome Message not set');
		}
	}

	const oldWelcome = config.welcomeMessage;
	if (newWelcome === 'unset') {
		config.welcomeMessage = null;
	} else {
		config.welcomeMessage = newWelcome;
	}

	await ConfigService.updateConfig(config, message);

	const audit = new MessageEmbed()
		.setColor(EmbedColours.neutral)
		.setAuthor(message.author.tag, message.author.displayAvatarURL())
		.setDescription(`Welcome Message ${!config.welcomeMessage ? 'Removed' : 'Updated'}`)
		.addField('New Welcome Message', !config.welcomeMessage ? 'Not set' : config.welcomeMessage)
		.addField('Old Welcome Message', !oldWelcome ? 'Not set' : oldWelcome)
		.setTimestamp();

	ChannelService.sendAuditMessage(client, config, audit);
};

const command: Command = {
	name: 'setwelcome',
	title: 'Sets the welcome message',
	description: 'Sets the welcome message that is messsaged to users when they join the server.',
	usage: 'setwelcome <welcome message>',
	example: 'setwelcome This is an example welcome message!',
	admin: true,
	deleteCmd: false,
	limited: false,
	channels: ['GUILD_TEXT'],
	run: run
};

export = command;