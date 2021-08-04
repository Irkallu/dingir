import { DateTime } from 'luxon';

export class Logger {
    public writeLog (log: string) {
        console.log(`${DateTime.local().toLocaleString(DateTime.DATETIME_SHORT)}: ${log}`);
    }

    public writeError (log: string, error?: string) {
        console.error(`${DateTime.local().toLocaleString(DateTime.DATETIME_SHORT)}: ${log}`);
        if (error) 
            console.error(`${DateTime.local().toLocaleString(DateTime.DATETIME_SHORT)}: ${error}`);
    }
}