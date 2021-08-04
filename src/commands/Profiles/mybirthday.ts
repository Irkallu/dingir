import { DateTime } from "luxon";
import axios from "axios";
import { Command } from "../../types/Command";
import { BirthdayManager } from "../../utilities/BirthdayManager";
import { NovaClient } from "../../client/NovaClient";
import { Message } from "discord.js";
import { ServerConfig } from "../../types/ServerConfig";
import { UserProfile } from "../../types/UserProfile";

const run = async (client: NovaClient, message: Message, config: ServerConfig, args: any[]) => {
	if(args.length < 1) {
		return message.channel.send(`Please provide your birthday in the format DD/MM ie. \`${config.prefix}mybirthday 30/12\` for 30th December`);
	}

	const birthdayManager = new BirthdayManager();
	const date = args[0].split('/');
	const month = parseInt(date[1], 10);
	let day = parseInt(date[0], 10);
	let alteredForLeap = false;

	const now = DateTime.local();

	if(!now.isInLeapYear && day === 29 && month === 2)
	{
		day--;
		alteredForLeap = true;
	}

	let nextDate = DateTime.local(now.year, month, day);

	if (nextDate <= now){
		nextDate = nextDate.plus({year: 1});
		if (nextDate.isInLeapYear && alteredForLeap){
			nextDate = nextDate.plus({day: 1});
		}
	}
	
	if (!nextDate.isValid) {
		return message.channel.send('Looks like that date was invalid, make sure it is in the format of day/month');
	}

	const profileRes = await axios.get(`${process.env.API_URL}/users/profile/${message.guild.id}/${message.author.id}`);

	const userProfile: UserProfile = profileRes.data;
	userProfile.birthdayDay = day;
	userProfile.birthdayMonth = month;

	await axios.patch(`${process.env.API_URL}/users/profile/`, userProfile)
		.catch(() => {
			return message.channel.send('Unable to update profile due to server error.');
		});


	message.channel.send(`I've set your next birthday to ${nextDate.toLocaleString(DateTime.DATE_FULL)}!`);
	await birthdayManager.populateCalendars(client, message.guild.id);
};

const command: Command = {
	name: 'mybirthday',
	title: 'My Birthday',
	description: 'Sets your Birthday day & month for birthday notifications!',
	usage: 'mybirthday DD/MM',
	example: 'mybirthday 18/09',
	admin: false,
	deleteCmd: false,
	limited: false,
	channels: ['text'],
	run: run
};

export = command;