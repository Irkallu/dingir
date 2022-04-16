import { MessageEmbed, TextChannel } from 'discord.js';
import { ServerConfig } from '../client/models/ServerConfig';
import { NovaClient } from '../client/NovaClient';

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
