import { UserProfile } from './../../types/UserProfile';
import axios from "axios";
import { Message, MessageEmbed } from "discord.js";
import { DateTime } from "luxon";
import { NovaClient } from "../../client/NovaClient";
import { EmbedColours } from "../../resources/EmbedColours";
import { Command } from "../../types/Command";
import { ServerConfig } from "../../types/ServerConfig";

const run = async (client: NovaClient, message: Message, config: ServerConfig, args: any[]) => {
	const mem = message.mentions.members.first();

	if (!mem) {
		return message.channel.send('Unable to find that member, or a member was not provided.');
	}

	const res = await axios.get(`${process.env.API_URL}/users/profile/${message.guild.id}/${mem.user.id}`)
	const userProfile = res.data as UserProfile;

	const embed = new MessageEmbed()
		.setThumbnail((mem.user.displayAvatarURL()))
		.setColor(EmbedColours.info)
		.setTitle('User Profile')
		.setTimestamp()
		.addField('Member', mem.toString())
		.addField('Nickname', mem.nickname ? mem.nickname : 'Not set')
		.addField('User tag', mem.user.tag)
		.addField('Joined', `<t:${Math.floor(mem.joinedTimestamp/1000)}:R>`)
		.addField('Activity Score', userProfile ? userProfile.activityScore ?? 0 : 'Not found')
		.addField('ID', mem.user.id);

	return message.channel.send(embed);
};

const command: Command = {
	name: 'profile',
	title: 'Display a member\'s profile',
	description: 'Displays some useful administration information for the given member.',
	usage: 'profile <user mention>',
	example: 'profile @discord',
	admin: true,
	deleteCmd: false,
	limited: false,
	channels: ['text'],
	run: run
};

export = command;