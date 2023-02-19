import type { IToll } from './toll';
import type { Event as ClocktowerEvent } from './event';

export interface IRecordTollCommand<TEvent extends ClocktowerEvent> {
    record(toll: IToll<TEvent>): void;

    canRecord(toll: IToll<TEvent>): boolean;
}

export interface ITollRecorder {
    readonly commands: Array<IRecordTollCommand<ClocktowerEvent>>;

    record(toll: IToll<ClocktowerEvent>): boolean;

    register(command: IRecordTollCommand<ClocktowerEvent>): void;
}

export class TollRecorder implements ITollRecorder {
    readonly commands: Array<IRecordTollCommand<ClocktowerEvent>>;

    constructor() {
        this.commands = [];
    }

    record(toll: IToll<ClocktowerEvent>): boolean {
        for (const command of this.commands) {
            if (command.canRecord(toll)) {
                command.record(toll);
                return true;
            }
        }

        return false;
    }

    register(command: IRecordTollCommand<ClocktowerEvent>): void {
        this.commands.push(command);
    }
}
