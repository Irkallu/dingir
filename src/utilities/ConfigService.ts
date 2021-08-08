import axios from 'axios';
import { Message } from 'discord.js';
import NodeCache from 'node-cache';
import { ServerConfig } from '../types/ServerConfig';
import { Logger } from './Logger';

export class ConfigService {
	public static configCache = new NodeCache({ stdTTL: 3600 });

	public static async updateConfig (config: ServerConfig, message: Message): Promise<boolean> {
		let updated = false;

		await axios.patch(`${process.env.API_URL}/config/`, config)
			.then(res => {
				if (res.status === 200) {
					updated = true;
					this.configCache.set(message.guild.id, config);
				}
			})
			.catch(() => {
				const messageContent = `Unable to update configuration for ${message.guild.name}.`;
				message.channel.send({ content: messageContent });
				updated = false;
			});

		
		return updated;
	}

	public static async getConfigByMessage (message: Message): Promise<ServerConfig | undefined> {
		const cachedConfig: ServerConfig = this.configCache.get(message.guild.id);
		if (cachedConfig)
			return cachedConfig;

		const res = await axios.get(`${process.env.API_URL}/config/${message.guild.id}`)
			.catch(() => {
				const messageContent = `Unable to get configuration for ${message.guild.name}.`;
				message.channel.send({ content: messageContent });
				return;
			});

		if (res && res.data) {
			this.configCache.set(message.guild.id, res.data);
			return res.data as ServerConfig;
		}
			
	}

	public static async getConfig (serverId: string): Promise<ServerConfig> {
		const cachedConfig: ServerConfig = this.configCache.get(serverId);
		if (cachedConfig)
			return cachedConfig;

		const res = await axios.get(`${process.env.API_URL}/config/${serverId}`)
			.catch(() => {
				return;
			});

		if (res && res.data) {
			this.configCache.set(serverId, res.data);
			return res.data as ServerConfig;
		}
	}

	public static async getConfigs(): Promise<ServerConfig[]> {
		const res = await axios.get(`${process.env.API_URL}/config`)
			.catch(() => {
				return;
			});

		if (res && res.data) {
			const serverConfigs = res.data as ServerConfig[];
			serverConfigs.forEach(config => {
				this.configCache.set(config.serverId, config);
			});
			return serverConfigs;
		}
			
	}

	public static async deleteConfig(serverId: string): Promise<boolean> {
		let deleted = false;

		await axios.delete(`${process.env.API_URL}/config/${serverId}`)
			.then(res => {
				deleted = res.status === 200;
			})
			.catch((err) => {
				Logger.writeError(`Error while deleting config for ${serverId}.`, err);
				deleted = false;
			});
			
		return deleted;
	}
}