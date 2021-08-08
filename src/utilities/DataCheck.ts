import axios from 'axios';
import _ from 'underscore';
import { NovaClient } from '../client/NovaClient';
import { UserProfile } from '../types/UserProfile';
import { Logger } from './Logger';

export class DataCheck {
	public static async dataCleanup(client: NovaClient): Promise<void> {
		Logger.writeLog('Running data checkup job.');

		const servers = await axios.get(`${process.env.API_URL}/config/`);
		const groupedSrvs = _.groupBy(servers.data, 'server_id');

		for (const srv in groupedSrvs) {
			const guild = await client.guilds.fetch(srv)
				.catch(err => {
					if (err.code === 50001) {
						Logger.writeLog(`No longer have access to guild: ${srv}.`);
						axios.delete(`${process.env.API_URL}/config/${srv}`).then(res => {
							Logger.writeLog(`Config deleted: ${res.status === 200}.`);
						});
						axios.delete(`${process.env.API_URL}/users/profile/${srv}`).then(res => {
							Logger.writeLog(`User profiles deleted: ${res.status === 200}.`);
						});
					}
				});

			if (guild) {
				const usersRes = await axios.get(`${process.env.API_URL}/users/profile/${guild.id}`);
				const users = usersRes.data;

				users.forEach((u: UserProfile) => {
					if(!guild.members.cache.get(u.userId))
						axios.delete(`${process.env.API_URL}/users/profile/${srv}/${u.userId}`).then(res => {
							Logger.writeLog(`User ${u.userId} no longer in server ${guild.id}.`);
							Logger.writeLog(`User profile deleted: ${res.status === 200}.`);
						});
				});
			}
		}

		Logger.writeLog('Data checkup job complete.');
	}
}