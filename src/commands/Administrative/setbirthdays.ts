import { Message } from 'discord.js';
import { NovaClient } from '../../client/NovaClient';
import { Command } from '../../types/Command';
import { ServerConfig } from '../../types/ServerConfig';
import { BirthdayManager } from '../../utilities/BirthdayManager';
import { ConfigService } from '../../utilities/ConfigService';

const run = async (client: NovaClient, message: Message, config: ServerConfig): Promise<any> => {
	const birthdaysCalendar = await message.channel.send('populating...');
	config.birthdayCalendarMessagePath = `${birthdaysCalendar.channel.id}/${birthdaysCalendar.id}`;
	const updated = await ConfigService.updateConfig(config, message);
	if (updated)
		await BirthdayManager.populateCalendars(client, message.guild.id);
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
	channels: ['GUILD_TEXT'],
	run: run
};

export = command;
