import dayjs, { Dayjs } from 'dayjs';
import { PastMomentRewrite } from './exception';
import { Confirm } from '~/interaction/confirm';

export class Toll {
    readonly when: Dayjs;

    constructor(timestamp?: number) {
        this.when = dayjs(timestamp);
    }
}

export type Meaning = any;

/**
 * {@link `glossory["Clocktower"]`}
 * Blood on the Clocktower, the world’s greatest bluffing game!
 */
export class Clocktower {
    readonly moments: Map<Meaning, Toll> = new Map();

    get chronology(): Array<[Meaning, Toll]> {
        const moments = Array.from(this.moments.entries());
        moments.sort((firstMoment, secondMoment) =>
            firstMoment[1].when.diff(secondMoment[1].when)
        );
        return moments;
    }

    get events(): Array<Meaning> {
        return this.chronology.map((moment) => moment[0]);
    }

    record(meaning?: Meaning) {
        if (
            this.moments.has(meaning) &&
            !new Confirm(`Overwrite recorded timestamp for ${meaning}?`).ask()
        ) {
            throw new PastMomentRewrite(
                meaning,
                this.moments.get(meaning)!.when,
                dayjs()
            );
        }

        this.moments.set(meaning, new Toll());
    }
}
