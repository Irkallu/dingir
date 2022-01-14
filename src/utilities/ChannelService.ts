import { MessageEmbed, TextChannel } from 'discord.js';
import { NovaClient } from '../client/NovaClient';
import { ServerConfig } from '../types/ServerConfig';

export class ChannelService {
	public static async sendAuditMessage (client: NovaClient, serverConfig: ServerConfig, embed: MessageEmbed): Promise<boolean> {
		if (!serverConfig.auditChannelId)
			return;

		const auditChannel = client.channels.cache.get(serverConfig.auditChannelId);
		if (!auditChannel || !auditChannel.isText)
			return;

		await (auditChannel as TextChannel)
			.send({ embeds: [embed]  });
	}
}
