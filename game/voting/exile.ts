import { ExileNonTraveller } from '../exception/exile-non-traveller';
import type { INomination } from '../nomination';
import { Nomination } from '../nomination';
import type { IVote } from './vote';
import { Vote } from './vote';

export interface IExile extends INomination {
    validate(): Promise<void>;
}

export class Exile extends Nomination implements IExile {
    async validate() {
        if (!(await this.nominated.isTraveller)) {
            throw new ExileNonTraveller(this);
        }
    }

    protected createVote(): IVote {
        return new Vote(this.nominated, true);
    }
}

export function isExile(value: unknown): value is IExile {
    return value instanceof Exile;
}
