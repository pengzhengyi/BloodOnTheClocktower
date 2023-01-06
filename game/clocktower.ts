import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { binarySearch } from './common';
import { Death } from './death';
import {
    EventNotExistInDate,
    PastMomentRewrite,
    RecallFutureDate,
    RecallFutureEvent,
    RecordUnknownEventInDiary,
} from './exception';
import { Execution } from './execution';
import { Exile } from './exile';
import { GamePhase, Phase } from './gamephase';
import type { Player } from './player';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

type Moment = Dayjs;
type MomentQuery =
    | 'isSameOrBefore'
    | 'isSameOrAfter'
    | 'isBefore'
    | 'isSame'
    | 'isAfter';
export type Event = Execution | Exile | Phase | Death;

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

    deaths: Map<Player, Toll<Death>> = new Map();

    phaseToMoment: Map<Phase, Toll<Phase>> = new Map();

    protected eventToMoment: Map<Event, Moment> = new Map();

    get hasExecution(): boolean {
        return this.execution !== undefined;
    }

    get hasExile(): boolean {
        return this.exiles.length > 0;
    }

    get executed(): Player | undefined {
        return this.execution?.forWhat.executed;
    }

    record(event: Event): Toll<Event> {
        const moment = this.tryRecord(event);
        const toll = new Toll(event, moment);

        if (event instanceof Execution) {
            return (this.execution = toll as Toll<Execution>);
        } else if (event instanceof Exile) {
            this.exiles.push(toll as Toll<Exile>);
            return toll;
        } else if (event instanceof Death) {
            this.deaths.set(event.player, toll as Toll<Death>);
            return toll;
        } else if (event in Phase) {
            this.phaseToMoment.set(event, toll as Toll<Phase>);
            return toll;
        }

        throw new RecordUnknownEventInDiary(this, event, moment);
    }

    getMoment(event: Event): Moment | undefined {
        return this.eventToMoment.get(event);
    }

    hasDead(player: Player): boolean {
        return this.deaths.has(player);
    }

    hasDiedAtNight(player: Player): boolean {
        const death = this.deaths.get(player);

        if (death === undefined) {
            return false;
        }

        return this.isMomentAtNight(death.when);
    }

    hasRecorded(event: Event): boolean {
        return this.eventToMoment.has(event);
    }

    isEventAtDay(event: Event): boolean {
        const moment = this.getMoment(event);

        if (moment === undefined) {
            throw new EventNotExistInDate(event, this);
        }

        return this.isMomentAtDay(moment);
    }

    isEventAtNight(event: Event): boolean {
        const moment = this.getMoment(event);

        if (moment === undefined) {
            throw new EventNotExistInDate(event, this);
        }

        return this.isMomentAtNight(moment);
    }

    isMomentAtDay(moment: Moment): boolean {
        return (
            this.isMomentSameOrAfterPhase(moment, Phase.Day) &&
            this.isMomentBeforePhase(moment, Phase.Dusk)
        );
    }

    isMomentAtNight(moment: Moment): boolean {
        return this.isMomentSameOrAfterPhase(moment, Phase.Night);
    }

    isMomentBeforePhase(moment: Moment, phase: Phase): boolean {
        return this.isMomentRelativeToPhase(moment, phase, 'isBefore', true);
    }

    isMomentSameOrBeforePhase(moment: Moment, phase: Phase): boolean {
        return this.isMomentRelativeToPhase(
            moment,
            phase,
            'isSameOrBefore',
            true
        );
    }

    isMomentAfterPhase(moment: Moment, phase: Phase): boolean {
        return this.isMomentRelativeToPhase(moment, phase, 'isAfter', false);
    }

    isMomentSameOrAfterPhase(moment: Moment, phase: Phase): boolean {
        return this.isMomentRelativeToPhase(
            moment,
            phase,
            'isSameOrAfter',
            false
        );
    }

    protected isMomentRelativeToPhase(
        moment: Moment,
        phase: Phase,
        query: MomentQuery,
        defaultWhenPhaseMomentNotPresent: boolean
    ) {
        const phaseMoment = this.getMoment(phase);

        if (phaseMoment === undefined) {
            return defaultWhenPhaseMomentNotPresent;
        }

        return moment[query](phaseMoment);
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
