import axios from 'axios';
import _ from 'underscore';
import { NovaClient } from '../client/NovaClient';

export class DataCheck {
	public async dataCleanup(client: NovaClient) {
		client.logger.writeLog('Running data checkup job.');

		const servers = await axios.get(`${process.env.API_URL}/config/`);
		const groupedSrvs = _.groupBy(servers.data, 'server_id');

		for (const srv in groupedSrvs) {
			const guild = await client.guilds.fetch(srv)
				.catch(err => {
					if (err.code === 50001) {
						client.logger.writeLog(`No longer have access to guild: ${srv}.`);
						axios.delete(`${process.env.API_URL}/config/${srv}`).then(res => {
							client.logger.writeLog(`Config deleted: ${res.status === 200}.`);
						});
						axios.delete(`${process.env.API_URL}/users/profile/${srv}`).then(res => {
							client.logger.writeLog(`User profiles deleted: ${res.status === 200}.`);
						});
					}
				});

			if (guild) {
				const usersRes = await axios.get(`${process.env.API_URL}/users/profile/${guild.id}`);
				const users = usersRes.data;

				users.forEach(u => {
					if(!guild.member(u.user_id))
						axios.delete(`${process.env.API_URL}/users/profile/${srv}/${u.user_id}`).then(res => {
							client.logger.writeLog(`User ${u.user_id} no longer in server ${guild.id}.`);
							client.logger.writeLog(`User profile deleted: ${res.status === 200}.`);
						});
				});
			}
		};

		client.logger.writeLog('Data checkup job complete.');
	}
};