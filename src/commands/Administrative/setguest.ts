import axios from "axios";
import { Message, MessageEmbed, TextChannel } from "discord.js";
import { NovaClient } from "../../client/NovaClient";
import { EmbedColours } from "../../resources/EmbedColours";
import { Command } from "../../types/Command";
import { ServerConfig } from "../../types/ServerConfig";

const run = async (client: NovaClient, message: Message, config: ServerConfig, args: any[]) => {
	if (args.length === 0) {
		if (!config.guestRoleIds) {
			return message.channel.send('No guest roles set');
		}

		let currentGuestRoles = [];
		return message.guild.roles.fetch()
			.then(roles => {
				let guestRoleIds = config.guestRoleIds.split(',');
				guestRoleIds.forEach(role => {
					const guestRole = roles.resolve(role);
					currentGuestRoles.push(guestRole ? `@${guestRole.name}` : 'Unknown role');
				});

				const embed = new MessageEmbed()
					.setColor(EmbedColours.info)
					.setTitle('Current Guest Roles')
					.setDescription(currentGuestRoles.join('\n'))
					.setTimestamp();

				return message.channel.send(embed);
			});


	}

	const newRoles = message.mentions.roles.map(role => role.id);

	if (args[0] === 'unset') {
		config.guestRoleIds = null;
	} else if (!newRoles) {
		return message.channel.send('Role not found, make sure you tagged it correctly.');
	} else {
		config.guestRoleIds = newRoles.join();
	}


	axios.patch(`${process.env.API_URL}/config/`, config)
		.catch(() => {
			return message.channel.send('Unable to update guest role due to server error.');
		});

	if (config.auditChannelId) {
		client.channels.fetch(config.auditChannelId)
			.then(channel => {
				const audit = new MessageEmbed()
					.setColor(EmbedColours.info)
					.setAuthor(message.author.tag, message.author.displayAvatarURL())
					.setDescription(`Guest roles ${!config.guestRoleIds ? 'Removed' : 'Updated'}`)
					.setTimestamp();

				if (!config.guestRoleIds) {
					audit.addField('New Guest Roles', 'Not set');
				} else {
					audit.addField('New Guest Roles', message.mentions.roles.map(role => `@${role.name}`).join('\n'));
				}

				(channel as TextChannel).send(audit);
			}).catch((err) => {
				client.logger.writeError(err);
			});
	}

	if (config.guestRoleIds) {
		return message.channel.send('Guest User role(s) updated.');
	} else {
		return message.channel.send('Guest User role removed.');
	}

};

const command: Command = {
	name: 'setguest',
	title: 'Set the guest roles',
	description: 'Sets the roles a user is given on accepting the rules for this server.',
	usage: 'setguest <role mentions>',
	example: 'setguest @somerole1 @somerole2',
	admin: true,
	deleteCmd: false,
	limited: false,
	channels: ['text'],
	run: run
};

export = command;
