import { CommandAccess } from "../utilities/CommandAccess";
import axios from 'axios';
import {  Message } from 'discord.js';
import { NovaClient } from '../client/NovaClient';
import { RunFunction } from '../types/Event';
import { ServerConfig } from "../types/ServerConfig";

export const name: string = 'message';

const runCommand = (client: NovaClient, message: Message, config: ServerConfig, command: string, args: any[]) => {

	const cmd = client.commands.get(command);

	if (!cmd) return;

	const commandAccess = new CommandAccess();
	const access = commandAccess.verifyAccess(cmd, message, config);

	if (!access.hasAccess) {
		return message.channel.send(access.reason);
	} else {
		cmd.run(client, message, config, args)
			.then(() => {
				if(cmd.deleteCmd) {
					message.delete()
						.catch(() => {
							if (message.guild && config.debug) {
								message.channel.send('Unable to delete command message.');
							}
						});
				}
			})
			.catch((err) => {
				message.channel.send('Something went wrong, was this command run in the correct place?');
				client.logger.writeError(err);
			});
	}
};

export const run: RunFunction = async (client: NovaClient, message: Message) => {
	if (message.author.bot) return;

	if (!message.guild) {
		const args = message.content.trim().split(/ +/g);
		const command = args.shift().toLowerCase();

		runCommand(client, message, undefined, command, args);
	}

	if (message.guild)
		axios.get(`${process.env.API_URL}/config/${message.guild.id}`).then(res => {
			axios.patch(`${process.env.API_URL}/users/profile/${message.guild.id}/${message.author.id}/messages/increment`);

			const config: ServerConfig = res.data;
			if (!message.content.startsWith(config.prefix)) return;
			const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
			const command = args.shift().toLowerCase();

			runCommand(client, message, config, command, args);

		}).catch(err => {
			client.logger.writeError(err);
			message.channel.send('Unable to fetch a config for this server.');
		});
    
};
