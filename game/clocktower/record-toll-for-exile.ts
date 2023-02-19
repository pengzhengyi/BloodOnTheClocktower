import { Exile } from '../exile';
import type { IToll } from './toll';
import type { IRecordTollCommand } from './toll-recorder';

export class RecordTollForExile implements IRecordTollCommand<Exile> {
    exiles: Array<IToll<Exile>>;

    constructor() {
        this.exiles = [];
    }

    record(toll: IToll<Exile>): void {
        this.exiles.push(toll);
    }

    canRecord(toll: IToll<Exile>): boolean {
        return toll.forWhat instanceof Exile;
    }
}
