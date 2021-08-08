import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { NovaClient } from '../../client/NovaClient';
import { EmbedColours } from '../../resources/EmbedColours';
import { Command } from '../../types/Command';
import { ServerConfig } from '../../types/ServerConfig';
import { ConfigService } from '../../utilities/ConfigService';

const run = async (client: NovaClient, message: Message, config: ServerConfig): Promise<any> => {
	const newRules = message.content.slice(config.prefix.length + command.name.length).trim();

	if (newRules.length === 0 && config.rulesMessage && config.rulesMessagePath) {
		config.rulesMessage = null;
		config.rulesMessagePath = null;
	} else if (!config.guestRoleIds) {
		return message.channel.send('No Guest Role has been set, so rules cannot be applied.');
	}

	if (config.rulesMessage && config.rulesMessagePath && newRules) {
		const [chanId, msgId] = config.rulesMessagePath.split('/');
		config.rulesMessage = newRules;
		ConfigService.updateConfig(config, message);
		

		const rulesChannel = await client.channels.fetch(chanId);
		const rulesMessage = await (rulesChannel as TextChannel).messages.fetch(msgId);

		rulesMessage.edit({ content: newRules });
		if (!config.announcementsChannelId)
			return;

		const announcementsChannel = await client.channels.fetch(config.announcementsChannelId);

		const announcement = new MessageEmbed()
			.setColor(EmbedColours.info)
			.setTitle('Rules have been updated')
			.setDescription(`Rules have been updated in this server, please review them in <#${chanId}>`)
			.setTimestamp();

		(announcementsChannel as TextChannel).send({ embeds: [announcement]  });
	} else if (!config.rulesMessage && newRules) {
		const rulesMessage = await message.channel.send(newRules);

		config.rulesMessagePath = `${rulesMessage.channel.id}/${rulesMessage.id}`;
		config.rulesMessage = newRules;

		ConfigService.updateConfig(config, message);
		return message.react('✅');
	} else {
		ConfigService.updateConfig(config, message);
		return message.channel.send('Rules removed.');
	}

};

const command: Command = {
	name: 'setrules',
	title: 'Set the rules',
	description: 'Sends the rules text in the same channel and then makes it reactable for agreement and role granting.',
	usage: 'setrules <rules>',
	example: 'setrules These are some example rules!',
	admin: true,
	deleteCmd: true,
	limited: false,
	channels: ['GUILD_TEXT'],
	run: run
};

export = command;
