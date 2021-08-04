import axios from 'axios';
import { Guild } from 'discord.js';
import { NovaClient } from '../client/NovaClient';
import { RunFunction } from '../types/Event';

export const name: string = 'guildDelete';
export const run: RunFunction = async (client: NovaClient, guild: Guild) => {
	const delConfigRes = await axios.delete(`${process.env.API_URL}/config/${guild.id}`)
		.catch(err => {
			client.logger.writeError(`Error occured deleting config for guild: ${guild.id}`, err);
		});
	const delUsersRes = await axios.delete(`${process.env.API_URL}/users/profile/${guild.id}`)
		.catch(err => {
			client.logger.writeError(`Error occured deleting users for guild: ${guild.id}`, err);
		});

	client.logger.writeLog(`Bot removed from guild: ${guild.id}.`);
	client.logger.writeLog(`Config deleted: ${delConfigRes && delConfigRes.status === 200}.`);
	client.logger.writeLog(`User profiles deleted: ${delUsersRes && delUsersRes.status === 200}.`);
};