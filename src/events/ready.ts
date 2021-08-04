import schedule from 'node-schedule';
import { NovaClient } from '../client/NovaClient';
import { RunFunction } from '../types/Event';
import { BirthdayManager } from '../utilities/BirthdayManager';
import { DataCheck } from '../utilities/DataCheck';

export const name: string = 'ready';
export const run: RunFunction = async (client: NovaClient) => {
	await client.user.setPresence({status: 'online'});

	const birthdayManager = new BirthdayManager();
	const dataCheck = new DataCheck();

	client.logger.writeLog('Online');
	const birthdaySchedule = schedule.scheduleJob(process.env.JOB_SCHEDULE, () => {
		dataCheck.dataCleanup(client);
		birthdayManager.notifyBirthdays(client);
		birthdayManager.populateCalendars(client);
	});
	client.logger.writeLog(`Primary schedule set, next run at ${birthdaySchedule.nextInvocation()}`);
};
