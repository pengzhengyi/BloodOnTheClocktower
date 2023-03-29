import type { IExecution } from '../voting/execution';
import { isExecution } from '../voting/execution';
import type { IToll } from './toll';
import type { IRecordTollCommand } from './toll-recorder';

export class RecordTollForExecution implements IRecordTollCommand<IExecution> {
    execution: IToll<IExecution> | undefined;

    record(toll: IToll<IExecution>): void {
        this.execution = toll;
    }

    canRecord(toll: IToll<IExecution>): boolean {
        return isExecution(toll.forWhat);
    }
}
