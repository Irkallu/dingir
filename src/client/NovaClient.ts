import { glob } from "glob";
import { Client, Collection, Intents } from "discord.js";
import { Command } from "../types/Command";
import { promisify } from "util";
import { Event } from "../types/Event";
import { Logger } from "../utilities/Logger";

const globPromise = promisify(glob);

class NovaClient extends Client {
	public commands: Collection<string, Command> = new Collection();
	public events: Collection<string, Event> = new Collection();

	public constructor() {
		super ({ 
			partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER'],
			intents: [	Intents.FLAGS.GUILDS,
						Intents.FLAGS.GUILD_MEMBERS,
						Intents.FLAGS.GUILD_MESSAGES,
						Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
						Intents.FLAGS.DIRECT_MESSAGES ] 
			});
	}

	public async start(): Promise<void> {
		if (process.env.NODE_ENV !== 'production') {
			require('dotenv').config();
		}

		const commandFiles: string[] = await globPromise(
			`${__dirname}/../commands/**/*{.js,.ts}`
		);
		const eventFiles: string[] = await globPromise(
			`${__dirname}/../events/**/*{.js,.ts}`
		);
		
		commandFiles.map(async (cmdFile: string) => {
			const cmd = (await import(cmdFile)) as Command;
			this.commands.set(cmd.name, cmd);
		});
		eventFiles.map(async (eventFile: string) => {
			const event = (await import(eventFile)) as Event;
			this.events.set(event.name, event);
			this.on(event.name, event.run.bind(null, this));
		});

		process.on('SIGTERM', () => {
			Logger.writeLog('SIGTERM Received, destroying client & shutting down.');
			this.destroy();
			process.exit();
		});

		await this.login(process.env.TOKEN);
		Logger.writeLog('Logged in');
	}
}

export { NovaClient };
