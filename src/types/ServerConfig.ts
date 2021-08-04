export interface ServerConfig {
    serverId: string,
    prefix: string,
    rulesMessagePath?: string,
    rulesMessage?: string,
    guestRoleIds?: string,
    adminRoleId?: string,
    createdAt?: Date,
    updatedAt?: Date,
    welcomeMessage?: string,
    debug?: boolean,
    auditChannelId?: string,
    welcomeMessageBackgroundUrl?: string,
    systemMessagesEnabled?: boolean,
	announcementsChannelId?: string,
    birthdayCalendarMessagePath?: string    
}