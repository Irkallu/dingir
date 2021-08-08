import { Canvas, registerFont, createCanvas, loadImage } from 'canvas';
import { GuildMember, MessageAttachment, MessageEmbed } from 'discord.js';
import { NovaClient } from '../client/NovaClient';
import { RunFunction } from '../types/Event';
import { ServerConfig } from '../types/ServerConfig';
import { DateTime } from 'luxon';
import { EmbedColours } from '../resources/EmbedColours';
import { ChannelService } from '../utilities/ChannelService';
import { ConfigService } from '../utilities/ConfigService';

export const name = 'guildMemberAdd';

const applyText = (canvas: Canvas, text: string, baseSize: number, weight: string) => {
	const ctx = canvas.getContext('2d');

	let fontSize = baseSize;

	do {
		ctx.font = `${weight} ${fontSize -= 1}px Roboto`;
	} while (ctx.measureText(text).width > canvas.width - 200);

	return ctx.font;
};

const sendSystemMessage = async (config: ServerConfig, member: GuildMember) => {
	const welcomeMessage = config.welcomeMessage.replace('{member}', `<@${member.id}>`);

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

	member.guild.systemChannel.send({ content: welcomeMessage, files: [attachment] });
};

export const run: RunFunction = async (client: NovaClient, member: GuildMember) => {
	const serverConfig = await ConfigService.getConfig(member.guild.id);

	const audit = new MessageEmbed()
		.setColor(EmbedColours.positive)
		.setAuthor(member.user.tag, member.user.displayAvatarURL())
		.setDescription('New member joined')
		.addField('ID', member.user.id)
		.setTimestamp();
				
	ChannelService.sendAuditMessage(client, serverConfig, audit);

	if (serverConfig.welcomeMessage && serverConfig.systemMessagesEnabled && serverConfig.welcomeMessageBackgroundUrl)
		sendSystemMessage(serverConfig, member);
};
