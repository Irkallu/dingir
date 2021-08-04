import { glob } from "glob";
import { Client, Collection } from "discord.js";
import { Command } from "../types/Command";
import { promisify } from "util";
import { Event } from "../types/Event";
import { Logger } from "../utilities/Logger";

const globPromise = promisify(glob);

class NovaClient extends Client {
	public commands: Collection<string, Command> = new Collection();
	public events: Collection<string, Event> = new Collection();
	public logger: Logger;

	public constructor() {
		super ({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
		this.logger = new Logger();
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
			this.logger.writeLog('SIGTERM Received, destroying client & shutting down.');
			this.destroy();
			process.exit();
		});

		await this.login(process.env.TOKEN);
		this.logger.writeLog('Logged in');
	}
}

export { NovaClient };