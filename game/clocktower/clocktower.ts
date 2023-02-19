import { RecallFutureDate } from '../exception/recall-future-date';
import { GamePhase, type IGamePhase } from '../game-phase';
import { Phase, toString } from '../phase';
import { Diary, type Event, type IDiary } from './diary';
import { Chronology, type IChronology } from '../chronology';
import type { IToll } from './toll';
import { moment, type Moment } from '../../utils/moment';
import {
    GamePhaseNotification,
    type IGamePhaseNotification,
} from '../event-notification/notification/game-phase';
import { GamePhaseEvent } from '../event-notification/event/game-phase';
import { RecallFutureEvent } from '../exception/recall-future-event';

export interface IClocktower {
    readonly gamePhase: IGamePhase;
    readonly today: IDiary;
    readonly notification: IGamePhaseNotification;

    record(event: Event): IToll<Event>;
    recall(dateIndex: number): IDiary;
    getMoment(gamePhase: IGamePhase): Moment;

    /**
     * Rewind in time to get past events during a time period.
     *
     * @param start The start of a time period. If undefined, it will be earlier than any potential events (like a timestamp of negative infinity).
     * @param end The end of a time period. If undefined, it will be later than any potential events (like a timestamp of positive infinity).
     * @returns All captured events during the defined time period.
     */
    rewind(start?: Moment, end?: Moment): Iterable<IToll<Event>>;
    advance(reason?: string): Promise<boolean>;

    toString(): string;
}

/**
 * {@link `glossary["Clocktower"]`}
 * Blood on the Clocktower, the world’s greatest bluffing game!
 */
export class Clocktower implements IClocktower {
    readonly gamePhase: IGamePhase;

    readonly notification: IGamePhaseNotification;

    get today(): IDiary {
        return this.diaries[this.dateIndex];
    }

    protected get dateIndex(): number {
        return this.gamePhase.dateIndex;
    }

    protected readonly diaries: Array<IDiary> = [];

    protected readonly chronology: IChronology<Event> = new Chronology();

    constructor() {
        this.gamePhase = GamePhase.setup();
        this.notification = new GamePhaseNotification();
        this.prepareForFirstDate();
    }

    record(event: Event): IToll<Event> {
        const toll = this.today.record(event);
        this.chronology.add(toll);
        return toll;
    }

    recall(dateIndex: number): IDiary {
        if (dateIndex < this.diaries.length) {
            return this.diaries[dateIndex];
        }

        throw new RecallFutureDate(dateIndex, this.dateIndex);
    }

    getMoment(gamePhase: IGamePhase): Moment {
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

    rewind(start?: Moment, end?: Moment): Iterable<IToll<Event>> {
        return this.chronology.rewind(start, end);
    }

    async advance(reason?: string): Promise<boolean> {
        const currentDate = this.dateIndex;

        if (!(await this.gamePhase.forceTransition(reason))) {
            return false;
        }

        await this.notifyPhaseUpdate();

        if (this.dateIndex > currentDate) {
            this.prepareForNewDate();
        }

        this.record(this.gamePhase.phase);
        return true;
    }

    toString() {
        return `Date ${this.dateIndex} ${toString(
            this.gamePhase.phase
        )} ${moment().format()}`;
    }

    protected prepareForFirstDate() {
        this.prepareForNewDate();
        const toll = this.today.record(Phase.Setup);
        this.chronology.add(toll);
    }

    protected prepareForNewDate() {
        this.diaries[this.dateIndex] = new Diary();
    }

    protected async notifyPhaseUpdate() {
        const event = new GamePhaseEvent(this.gamePhase);
        return await this.notification.notify(event);
    }
}
