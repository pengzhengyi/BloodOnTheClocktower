import dayjs, { Dayjs } from 'dayjs';
import { PastMomentRewrite, RecallFutureDate } from './exception';
import { Execution } from './execution';
import { Exile } from './exile';
import { GamePhase, Phase } from './gamephase';

type Moment = Dayjs;
export type Event = Execution | Exile | Phase;

export function moment(timestamp?: number): Moment {
    return dayjs(timestamp);
}

export class Toll<T> {
    readonly when: Moment;

    readonly forWhat: T;

    constructor(forWhat: T, timestamp?: number | Moment) {
        if (timestamp instanceof Dayjs) {
            this.when = timestamp;
        } else {
            this.when = moment(timestamp);
        }

        this.forWhat = forWhat;
    }
}

export class Diary {
    execution?: Toll<Execution>;

    exiles: Array<Toll<Exile>> = [];

    phaseToMoment: Map<Phase, Moment> = new Map();

    protected eventToMoment: Map<Event, Moment> = new Map();

    get hasExecution(): boolean {
        return this.execution !== undefined;
    }

    get hasExile(): boolean {
        return this.exiles.length > 0;
    }

    record(event: Event): boolean {
        const moment = this.tryRecord(event);

        if (event instanceof Execution) {
            this.execution = new Toll(event, moment);
            return true;
        } else if (event instanceof Exile) {
            this.exiles.push(new Toll(event, moment));
            return true;
        } else if (event in Phase) {
            this.phaseToMoment.set(event, moment);
            return true;
        }

        return false;
    }

    getMoment(event: Event): Moment | undefined {
        return this.eventToMoment.get(event);
    }

    hasRecorded(event: Event): boolean {
        return this.eventToMoment.has(event);
    }

    protected tryRecord(event: Event): Moment {
        if (this.hasRecorded(event)) {
            throw new PastMomentRewrite(
                this,
                event,
                this.getMoment(event)!,
                dayjs()
            );
        }

        const newMoment = moment();
        this.eventToMoment.set(event, newMoment);

        return newMoment;
    }
}

/**
 * {@link `glossary["Clocktower"]`}
 * Blood on the Clocktower, the world’s greatest bluffing game!
 */
export class Clocktower {
    protected diaries: Array<Diary> = [];

    readonly gamePhase: GamePhase;

    get dateIndex(): number {
        return this.gamePhase.dateIndex;
    }

    get phase(): Phase {
        return this.gamePhase.phase;
    }

    get isFirstNight(): boolean {
        return this.gamePhase.isFirstNight;
    }

    get isNonfirstNight(): boolean {
        return this.gamePhase.isNonfirstNight;
    }

    get isDay(): boolean {
        return this.gamePhase.isDay;
    }

    get isNight(): boolean {
        return this.gamePhase.isNight;
    }

    get today(): Diary {
        return this.diaries[this.dateIndex];
    }

    constructor() {
        this.gamePhase = GamePhase.setup();
        this.prepareForFirstDate();
    }

    record(event: Event): boolean {
        return this.today.record(event);
    }

    recall(dateIndex: number): Diary {
        if (dateIndex < this.diaries.length) {
            return this.diaries[dateIndex];
        }

        throw new RecallFutureDate(dateIndex, this.dateIndex);
    }

    async advance(reason?: string): Promise<boolean> {
        const currentDate = this.dateIndex;

        if (!(await this.gamePhase.forceTransition(reason))) {
            return false;
        }

        if (this.dateIndex > currentDate) {
            this.prepareForNewDate();
        }

        this.record(this.gamePhase.phase);
        return true;
    }

    protected prepareForFirstDate() {
        this.prepareForNewDate();
        this.today.record(Phase.Setup);
    }

    protected prepareForNewDate() {
        this.diaries[this.dateIndex] = new Diary();
    }
}
