export interface UserProfile {
    serverId: string,
    userId: string,
    birthdayYear?: number,
    birthdayMonth?: number,
    birthdayDay?: number,
    createdAt?: Date,
    updatedAt?: Date,
    activityScore?: number
}