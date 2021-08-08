import { Message } from 'discord.js';
import { NovaClient } from '../client/NovaClient';
import { ServerConfig } from './ServerConfig';

export interface Command {
	name: string,
    run(client: NovaClient, message: Message, config: ServerConfig, args: any[]): Promise<void>
	title: string
	description: string
	usage: string
	example: string,
	admin: boolean,
	deleteCmd: boolean,
	limited: boolean,
	limitation?: string,
	channels: string[]
}