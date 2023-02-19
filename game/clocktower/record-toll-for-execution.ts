import { Execution } from '../execution';
import type { IToll } from './toll';
import type { IRecordTollCommand } from './toll-recorder';

export class RecordTollForExecution implements IRecordTollCommand<Execution> {
    execution: IToll<Execution> | undefined;

    record(toll: IToll<Execution>): void {
        this.execution = toll;
    }

    canRecord(toll: IToll<Execution>): boolean {
        return toll.forWhat instanceof Execution;
    }
}
