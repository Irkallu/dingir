import { NovaClient } from '../client/NovaClient';
export interface RunFunction {
	(client: NovaClient, ...params: any[]): Promise<unknown>;
}
export interface Event {
	name: string;
	run: RunFunction;
}