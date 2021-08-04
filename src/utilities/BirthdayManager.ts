import { NovaClient } from "../client/NovaClient";
import axios from 'axios';
import { TextChannel } from "discord.js";
import { DateTime } from "luxon";
import _ from 'underscore';
import { ServerConfig } from "../types/ServerConfig";
import { UserProfile } from "../types/UserProfile";

export class BirthdayManager {
	public async populateCalendars (client: NovaClient, serverId?: string) {
		client.logger.writeLog('Running birthday calendar update job.');

		serverId = serverId ?? '';
	
		const profileRes = await axios.get(`${process.env.API_URL}/users/birthdays/all/${serverId}`);
		const profiles = profileRes.data as UserProfile[];
		const usersWithBirthdaysByServer = _.groupBy(profiles, 'serverId');
		
		for (const server in usersWithBirthdaysByServer) {
			const res = await axios.get(`${process.env.API_URL}/config/${server}`)
				.catch(err => {
					return client.logger.writeError('Error getting birthdays.', err);
				});
	
			if (!res)
				return;
				
			const config: ServerConfig = res.data;
			if (config && config.birthdayCalendarMessagePath) {
				const [chan, msg] = config.birthdayCalendarMessagePath.split('/');
				
				const chanToEdit = await client.channels.fetch(chan);
				if (!chanToEdit)
					return client.logger.writeError(`Could not find birthday channel for server ${config.serverId}`);
				const msgToEdit = await (chanToEdit as TextChannel).messages.fetch(msg);
				
				if (msgToEdit) {
					const users = usersWithBirthdaysByServer[server];
					const mapped = users.map(u => {
						let alteredForLeap = false;
	
						const now = DateTime.local();
	
						if (!now.isInLeapYear && u.birthdayDay === 29 && u.birthdayMonth === 2) {
							u.birthdayDay--;
							alteredForLeap = true;
						}
	
						let nextDate = DateTime.local(now.year, u.birthdayMonth, u.birthdayDay);
	
						if (nextDate <= now) {
							nextDate = nextDate.plus({year: 1});
							if (nextDate.isInLeapYear && alteredForLeap) {
								nextDate = nextDate.plus({day: 1});
							}
						}
	
						return {userId: u.userId, birthday: nextDate};
					});
	
					const sorted = _.sortBy(mapped, (o) => o.birthday).slice(0, 10);
					const groupedSort = _.groupBy(sorted, 'birthday');
	
					let calMsg = (':tada: ~ Upcoming Birthdays ~ :tada:\n');
					calMsg += ('Here\'s the next 10 birthdays in this guild!\n');
					calMsg += (`Add your birthday using \`${config.prefix}mybirthday\`\n`);
					calMsg += ('-------------');
	
					for (const group in groupedSort) {
						const date = groupedSort[group][0].birthday.toLocaleString(DateTime.DATE_FULL);
						let members = '';
	
						groupedSort[group].forEach(m => {
							members += `<@${m.userId}>\n`;
						});
						calMsg += (`\n**${date}**\n${members}`);
						calMsg += ('-------------');
					}
	
					msgToEdit.edit(calMsg, {'allowedMentions': { 'users' : []}});
				}
	
			}
		}

		client.logger.writeLog('Finished birthday calendar update job.');
	}

	public async notifyBirthdays(client: NovaClient) {
		client.logger.writeLog('Running birthday notifications job.');

		const profileRes = await axios.get(`${process.env.API_URL}/users/birthdays`);
		const profiles = profileRes.data as UserProfile[];
		const usersWithBirthdaysByServer = _.groupBy(profiles, 'serverId');
		
		for (const server in usersWithBirthdaysByServer) {
			const res = await axios.get(`${process.env.API_URL}/config/${server}`)
				.catch(err => {
					return client.logger.writeError('Error getting birthdays.', err);
				});

			if (!res)
				return;

			const config: ServerConfig = res.data;
			if (config && config.announcementsChannelId) {
				const srv = await client.guilds.fetch(server)
					.catch(err => {
						return client.logger.writeError('Error getting server.', err);
					});
				const chan = await client.channels.fetch(config.announcementsChannelId)
					.catch(err => {
						return client.logger.writeError('Error getting channel.', err);
					});
				if (!srv || !chan) {
					return client.logger.writeError('Channel or Server object empty');
				}
				let tags = '';
				usersWithBirthdaysByServer[server].forEach(u => {
					if (srv.member(u.userId))
						tags += `<@${u.userId}>, `;
				});
				if (tags) {
					tags = tags.replace(/,\s*$/, '');
					let msg = `Happy Birthday to ${tags}!`;
					return (chan as TextChannel).send(msg)
						.catch(err => {
							return client.logger.writeError('Error sending Birthday message', err);
						});
				}
			}
		}
		client.logger.writeLog('Finished birthday notifications job.');
	}
}