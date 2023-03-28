import type { IExile } from '../voting/exile';
import { isExile } from '../voting/exile';
import type { IToll } from './toll';
import type { IRecordTollCommand } from './toll-recorder';

export class RecordTollForExile implements IRecordTollCommand<IExile> {
    exiles: Array<IToll<IExile>>;

    constructor() {
        this.exiles = [];
    }

    record(toll: IToll<IExile>): void {
        this.exiles.push(toll);
    }

    canRecord(toll: IToll<IExile>): boolean {
        return isExile(toll.forWhat);
    }
}
