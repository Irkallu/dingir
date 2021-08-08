import axios from 'axios';
import { UserProfile } from '../types/UserProfile';
import { Logger } from './Logger';

export class UserProfileService {
	public static async getServerBirthdays (serverId: string): Promise<UserProfile[]> {
		const res = await axios.get(`${process.env.API_URL}/users/birthdays/all/${serverId}`)
			.catch((err) => {
				return Logger.writeError('Error fetching birthdays.', err);
			});

		if (res && res.data)
			return res.data as UserProfile[];
	}

	public static async getUserProfile (serverId: string, userId: string): Promise<UserProfile>{
		const res = await axios.get(`${process.env.API_URL}/users/profile/${serverId}/${userId}`)
			.catch(() => {
				return;
			});

		if (res && res.data) {
			return res.data as UserProfile;
		}
	}

	public static async incrementActivityScore (serverId: string, userId: string): Promise<void> {
		axios.patch(`${process.env.API_URL}/users/profile/${serverId}/${userId}/messages/increment`)
			.catch((err) => {
				return Logger.writeError(`Error incrementing activity for ${userId} in ${serverId}`, err);
			});
	}

	public static async decrementActivityScore (serverId: string, userId: string): Promise<void> {
		axios.patch(`${process.env.API_URL}/users/profile/${serverId}/${userId}/messages/decrement`)
			.catch((err) => {
				return Logger.writeError(`Error decrementing activity for ${userId} in ${serverId}`, err);
			});
	}

	public static async deleteUser (serverId: string, userId: string): Promise<boolean> {
		let deleted = false;

		await axios.delete(`${process.env.API_URL}/users/profile/${serverId}/${userId}`)
			.then(res => {
				deleted = res.status == 200;
			})
			.catch(err => {
				Logger.writeError(`Error deleting user data for ${userId} in ${serverId}.`, err);
				deleted = false;
			});

		return deleted;
	}

	public static async deleteUsersByServer (serverId: string): Promise<boolean> {
		let deleted = false;

		await axios.delete(`${process.env.API_URL}/users/profile/${serverId}`)
			.then(res => {
				deleted = res.status == 200;
			})
			.catch(err => {
				Logger.writeError(`Error deleting user data for server ${serverId}.`, err);
				deleted = false;
			});

		return deleted;
	}

	public static async updateUserProfile (userProfile: UserProfile): Promise<boolean> {
		let updated = false;

		await axios.patch(`${process.env.API_URL}/users/profile/`, userProfile)
			.then(res => {
				updated = res.status === 200;
			})
			.catch(err => {
				Logger.writeError(`Error updating user data for user ${userProfile.userId} server ${userProfile.serverId}.`, err);
				updated = false;
			});

		return updated;
	}
}