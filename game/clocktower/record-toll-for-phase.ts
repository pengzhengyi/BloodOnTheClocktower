import type { Phase } from '../phase';
import { isPhase } from '../phase';
import type { IToll } from './toll';
import type { IRecordTollCommand } from './toll-recorder';

export class RecordTollForPhase implements IRecordTollCommand<Phase> {
    phaseToMoment: Map<Phase, IToll<Phase>>;

    constructor() {
        this.phaseToMoment = new Map();
    }

    record(toll: IToll<Phase>): void {
        this.phaseToMoment.set(toll.forWhat, toll);
    }

    canRecord(toll: IToll<Phase>): boolean {
        return isPhase(toll.forWhat);
    }
}
