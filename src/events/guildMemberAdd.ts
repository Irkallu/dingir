import { Canvas, registerFont, createCanvas, loadImage } from 'canvas';
import axios from 'axios';
import { GuildMember, MessageAttachment, MessageEmbed, TextChannel } from 'discord.js';
import { NovaClient } from '../client/NovaClient';
import { RunFunction } from '../types/Event';
import { ServerConfig } from '../types/ServerConfig';
import { DateTime } from 'luxon';
import { EmbedColours } from '../resources/EmbedColours';

export const name: string = 'guildMemberAdd';

const applyText = (canvas: Canvas, text: string, baseSize: number, weight: string) => {
	const ctx = canvas.getContext('2d');

	let fontSize = baseSize;

	do {
		ctx.font = `${weight} ${fontSize -= 1}px Roboto`;
	} while (ctx.measureText(text).width > canvas.width - 200);

	return ctx.font;
};

const sendAudit = (client: NovaClient, config: ServerConfig, member: GuildMember) => {
	if (config.auditChannelId) {
		client.channels.fetch(config.auditChannelId)
			.then(channel => {
				const audit = new MessageEmbed()
					.setColor(EmbedColours.positive)
					.setAuthor(member.user.tag, member.user.displayAvatarURL())
					.setDescription('New member joined')
					.addField('ID', member.user.id)
					.setTimestamp();
				(channel as TextChannel).send(audit);
			}).catch((err) => {
				client.logger.writeError(err);
			});
	}
};

const sendSystemMessage = async (config: ServerConfig, member: GuildMember) => {
	if (config.welcomeMessage
        && config.systemMessagesEnabled
        && config.welcomeMessageBackgroundUrl) {
		let welcomeMessage = config.welcomeMessage.replace('{member}', `<@${member.id}>`);

		registerFont(`${__dirname}/../resources/fonts/Roboto-Regular.ttf`, { family: 'Roboto', weight: 'regular'});

		const canvas = createCanvas(700, 250);
		const ctx = canvas.getContext('2d');
		const joinedTs = DateTime.fromMillis(member.joinedTimestamp).toLocaleString((DateTime.DATE_FULL));

		// Draw background
		const background = await loadImage(config.welcomeMessageBackgroundUrl);
		ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

		// Draw Username
		ctx.font = applyText(canvas, member.user.tag, 48, 'regular');
		ctx.fillStyle = '#ffffff';
		ctx.fillText(member.user.tag, 225, 125);

		// Draw Server name
		ctx.font = applyText(canvas, `Welcome to ${member.guild.name}!`, 34, 'regular');
		ctx.fillStyle = '#ffffff';
		ctx.fillText(`Welcome to ${member.guild.name}!`, 225, 160);

		// Draw Joined at
		ctx.font = applyText(canvas, `Joined: ${joinedTs}`, 20, 'regular');
		ctx.fillStyle = '#ffffff';
		ctx.fillText(`Joined: ${joinedTs}`, 225, 200);

		// Draw Avatar
		ctx.beginPath();
		ctx.arc(125, 125, 75, 0, Math.PI * 2, true);
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
		ctx.lineWidth = 10;
		ctx.stroke();
		ctx.closePath();
		ctx.clip();

		const avatar = await loadImage(member.user.displayAvatarURL({ format: 'jpg' }));
		ctx.drawImage(avatar, 50, 50, 150, 150);

		const attachment = new MessageAttachment(canvas.toBuffer(), 'welcome-image.png');

		await member.guild.systemChannel.send(welcomeMessage, attachment);

	}
};

export const run: RunFunction = async (client: NovaClient, member: GuildMember) => {
	axios.get(`${process.env.API_URL}/config/${member.guild.id}`).then(async res => {
		const config: ServerConfig = res.data;
		sendAudit(client, config, member);
		await sendSystemMessage(config, member);
	}).catch((err) => {
		client.logger.writeError(err);
	});
};
