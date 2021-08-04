import axios from "axios";
import { Message } from "discord.js";
import { NovaClient } from "../../client/NovaClient";
import { Command } from "../../types/Command";
import { ServerConfig } from "../../types/ServerConfig";
import { BirthdayManager } from "../../utilities/BirthdayManager";

const run = async (client: NovaClient, message: Message, config: ServerConfig, args: any[]) => {
	const birthdayManager = new BirthdayManager();

	message.channel.send('populating...')
		.then(message => {
			config.birthdayCalendarMessagePath = `${message.channel.id}/${message.id}`;
			axios.patch(`${process.env.API_URL}/config/`, config)
				.catch(() => {
					return message.channel.send('Unable to update rules due to server error.');
				});
				birthdayManager.populateCalendars(client, message.guild.id)
		})
		.catch((err) => {
			client.logger.writeError(err);
		});
};

const command: Command = {
	name: 'setbirthdays',
	title: 'Set the message to hold guild calendar.',
	description: 'Sends a holder message for the guild birthday calendar.',
	usage: 'setbirthdays',
	example: 'setbirthdays',
	admin: true,
	deleteCmd: true,
	limited: false,
	channels: ['text'],
	run: run
};

export = command;