import axios from 'axios';
import { Guild } from 'discord.js';
import { NovaClient } from '../client/NovaClient';
import { RunFunction } from '../types/Event';

export const name: string = 'guildCreate';
export const run: RunFunction = async (client: NovaClient, guild: Guild) => {
	axios.get(`${process.env.API_URL}/config/${guild.id}`)
		.catch((err) => {
			client.logger.writeError(`Unable to get config for ${guild.id}`, err);
		});
};
