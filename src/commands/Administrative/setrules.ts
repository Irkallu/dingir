import axios from "axios";
import { Message, MessageEmbed, TextChannel } from "discord.js";
import { NovaClient } from "../../client/NovaClient";
import { EmbedColours } from "../../resources/EmbedColours";
import { Command } from "../../types/Command";
import { ServerConfig } from "../../types/ServerConfig";

const run = async (client: NovaClient, message: Message, config: ServerConfig, args: any[]) => {
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

		client.channels.fetch(chanId).then(rulesChan => {
			(rulesChan as TextChannel).messages.fetch(msgId)
				.then(msg => {
					msg.edit(newRules);
					if (config.announcementsChannelId) {
						client.channels.fetch(config.announcementsChannelId).then(channel => {
							const msg = new MessageEmbed()
								.setColor(EmbedColours.info)
								.setTitle('Rules have been updated')
								.setDescription(`Rules have been updated in this server, please review them in <#${chanId}>`)
								.setTimestamp();
							(channel as TextChannel).send(msg)
								.catch(err => {
									message.channel.send('Error sending audit announcement.');
									return client.logger.writeError(`Error sending audit announcement in guild ${message.guild}`, err);
								});
						});
					}
				})
				.catch(err => {
					message.channel.send('Error updating rules message.');
					return client.logger.writeError(err);
				});
		});
	} else if (!config.rulesMessage && newRules) {
		message.channel.send(newRules)
			.then(message => {
				config.rulesMessagePath = `${message.channel.id}/${message.id}`;
				config.rulesMessage = newRules;
				axios.patch(`${process.env.API_URL}/config/`, config)
					.catch(() => {
						return message.channel.send('Unable to update rules due to server error.');
					});
				return message.react('✅')
					.catch((err) => {
						client.logger.writeError(err);
					});
			})
			.catch((err) => {
				client.logger.writeError(err);
			});
	} else {
		axios.patch(`${process.env.API_URL}/config/`, config)
			.catch(() => {
				return message.channel.send('Unable to remove rules due to server error.');
			});
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
	channels: ['text'],
	run: run
};

export = command;
