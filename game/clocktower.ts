import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { binarySearch } from './common';
import {
    PastMomentRewrite,
    RecallFutureDate,
    RecallFutureEvent,
    RecordUnknownEventInDiary,
} from './exception';
import { Execution } from './execution';
import { Exile } from './exile';
import { GamePhase, Phase } from './gamephase';

dayjs.extend(isSameOrBefore);

type Moment = Dayjs;
export type Event = Execution | Exile | Phase;

export function moment(timestamp?: number): Moment {
    return dayjs(timestamp);
}

export class Toll<T> {
    readonly when: Moment;

    readonly forWhat: T;

    constructor(forWhat: T, timestamp?: number | Moment) {
        if (timestamp instanceof dayjs) {
            this.when = timestamp as Moment;
        } else {
            this.when = moment(timestamp as number | undefined);
        }

        this.forWhat = forWhat;
    }

    isBefore<U = T>(other: Toll<U>): boolean {
        return this.when.isBefore(other.when);
    }

    isAfter<U = T>(other: Toll<U>): boolean {
        return this.when.isAfter(other.when);
    }
}

export class Chronology<T> {
    protected readonly tolls: Array<Toll<T>> = [];

    add(toll: Toll<T>) {
        let indexToInsertAfter = this.tolls.length - 1;
        for (; indexToInsertAfter >= 0; indexToInsertAfter--) {
            const existingToll = this.tolls[indexToInsertAfter];
            if (toll.isBefore(existingToll)) {
                continue;
            } else {
                break;
            }
        }

        this.tolls.splice(indexToInsertAfter + 1, 0, toll);
    }

    *rewind(start?: Moment, end?: Moment): Iterable<Toll<T>> {
        const startIndexExclusive =
            start === undefined
                ? -1
                : binarySearch(this.tolls, (toll) => toll.when.isBefore(start));
        const endIndexInclusive =
            end === undefined
                ? this.tolls.length - 1
                : binarySearch(this.tolls, (toll) =>
                      toll.when.isSameOrBefore(end)
                  );

        for (let i = startIndexExclusive + 1; i <= endIndexInclusive; i++) {
            yield this.tolls[i];
        }
    }
}

export class Diary {
    execution?: Toll<Execution>;

    exiles: Array<Toll<Exile>> = [];

    phaseToMoment: Map<Phase, Toll<Phase>> = new Map();

    protected eventToMoment: Map<Event, Moment> = new Map();

    get hasExecution(): boolean {
        return this.execution !== undefined;
    }

    get hasExile(): boolean {
        return this.exiles.length > 0;
    }

    record(event: Event): Toll<Event> {
        const moment = this.tryRecord(event);

        if (event instanceof Execution) {
            return (this.execution = new Toll(event, moment));
        } else if (event instanceof Exile) {
            const toll = new Toll(event, moment);
            this.exiles.push(toll);
            return toll;
        } else if (event in Phase) {
            const toll = new Toll(event, moment);
            this.phaseToMoment.set(event, toll);
            return toll;
        }

        throw new RecordUnknownEventInDiary(this, event, moment);
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
    protected readonly diaries: Array<Diary> = [];

    protected readonly chronology = new Chronology<Event>();

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

    record(event: Event): Toll<Event> | undefined {
        const toll = this.today.record(event);
        this.chronology.add(toll);
        return toll;
    }

    recall(dateIndex: number): Diary {
        if (dateIndex < this.diaries.length) {
            return this.diaries[dateIndex];
        }

        throw new RecallFutureDate(dateIndex, this.dateIndex);
    }

    getMoment(gamePhase: GamePhase): Moment {
        const dateIndex = gamePhase.dateIndex;
        const diary = this.recall(dateIndex);
        const moment = diary.getMoment(gamePhase.phase);

        if (moment === undefined) {
            throw new RecallFutureEvent(
                dateIndex,
                gamePhase.phase,
                this.dateIndex
            );
        }

        return moment;
    }

    /**
     * Rewind in time to get past events during a time period.
     *
     * @param start The start of a time period. If undefined, it will be earlier than any potential events (like a timestamp of negative infinity).
     * @param end The end of a time period. If undefined, it will be later than any potential events (like a timestamp of positive infinity).
     * @returns All captured events during the defined time period.
     */
    rewind(start?: Moment, end?: Moment): Iterable<Toll<Event>> {
        return this.chronology.rewind(start, end);
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
        const toll = this.today.record(Phase.Setup);
        this.chronology.add(toll);
    }

    protected prepareForNewDate() {
        this.diaries[this.dateIndex] = new Diary();
    }
}
