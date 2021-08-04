import axios from "axios";
import { Message, MessageEmbed, TextChannel } from "discord.js";
import { NovaClient } from "../../client/NovaClient";
import { EmbedColours } from "../../resources/EmbedColours";
import { Command } from "../../types/Command";
import { ServerConfig } from "../../types/ServerConfig";

const run = async (client: NovaClient, message: Message, config: ServerConfig, args: any[]) => {
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

	axios.patch(`${process.env.API_URL}/config/`, config)
		.catch(() => {
			return message.channel.send('Unable to update welcome message due to server error.');
		});

	if (config.auditChannelId) {
		client.channels.fetch(config.auditChannelId)
			.then(channel => {
				const audit = new MessageEmbed()
					.setColor(EmbedColours.neutral)
					.setAuthor(message.author.tag, message.author.displayAvatarURL())
					.setDescription(`Welcome Message ${!config.welcomeMessage ? 'Removed' : 'Updated'}`)
					.addField('New Welcome Message', !config.welcomeMessage ? 'Not set' : config.welcomeMessage)
					.addField('Old Welcome Message', !oldWelcome ? 'Not set' : oldWelcome)
					.setTimestamp();
				(channel as TextChannel).send(audit);
			}).catch((err) => {
				client.logger.writeError(err);
			});
	}

	if (!config.welcomeMessage) {
		return message.channel.send('Welcome message removed.');
	} else {
		return message.channel.send('Welcome message updated.');
	}

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
	channels: ['text'],
	run: run
};

export = command;