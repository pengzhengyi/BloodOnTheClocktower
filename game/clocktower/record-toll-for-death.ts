import { Death } from '../death';
import type { IPlayer } from '../player/player';
import type { IToll } from './toll';
import type { IRecordTollCommand } from './toll-recorder';

export class RecordTollForDeath implements IRecordTollCommand<Death> {
    deaths: Map<IPlayer, IToll<Death>>;

    constructor() {
        this.deaths = new Map();
    }

    record(toll: IToll<Death>): void {
        this.deaths.set(toll.forWhat.player, toll);
    }

    canRecord(toll: IToll<Death>): boolean {
        return toll.forWhat instanceof Death;
    }
}
