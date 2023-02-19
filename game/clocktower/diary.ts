import type { Death } from '../death';
import { EventNotExistInDate } from '../exception/event-not-exist-in-date';
import { PastMomentRewrite } from '../exception/past-moment-rewrite';
import { RecordUnknownEventInDiary } from '../exception/record-unknown-event-in-diary';
import type { Execution } from '../execution';
import type { Exile } from '../exile';
import { moment, type Moment } from '../../utils/moment';
import { Phase } from '../phase';
import type { IPlayer } from '../player';
import { type IToll, Toll } from './toll';
import type { Event as ClocktowerEvent } from './event';
import type { ITollRecorder } from './toll-recorder';
import { TollRecorder } from './toll-recorder';
import { RecordTollForDeath } from './record-toll-for-death';
import { RecordTollForExecution } from './record-toll-for-execution';
import { RecordTollForExile } from './record-toll-for-exile';
import { RecordTollForPhase } from './record-toll-for-phase';

type MomentQuery =
    | 'isSameOrBefore'
    | 'isSameOrAfter'
    | 'isBefore'
    | 'isSame'
    | 'isAfter';

/**
 * A diary records important events within a date.
 */
export interface IDiary {
    // fundamental properties
    readonly execution: IToll<Execution> | undefined;
    readonly exiles: Array<IToll<Exile>>;
    readonly deaths: Map<IPlayer, IToll<Death>>;
    readonly phaseToMoment: Map<Phase, IToll<Phase>>;

    // utility properties
    hasExecution: boolean;
    hasExile: boolean;
    executed: IPlayer | undefined;

    record(event: ClocktowerEvent): IToll<ClocktowerEvent>;
    getMoment(event: ClocktowerEvent): Moment | undefined;
    hasDead(player: IPlayer): boolean;
    hasDiedAtNight(player: IPlayer): boolean;
    hasRecorded(event: ClocktowerEvent): boolean;
    isEventAtDay(event: ClocktowerEvent): boolean;
    isEventAtNight(event: ClocktowerEvent): boolean;
    isMomentAtDay(moment: Moment): boolean;
    isMomentAtNight(moment: Moment): boolean;
    isMomentBeforePhase(moment: Moment, phase: Phase): boolean;
    isMomentSameOrBeforePhase(moment: Moment, phase: Phase): boolean;
    isMomentAfterPhase(moment: Moment, phase: Phase): boolean;
    isMomentSameOrAfterPhase(moment: Moment, phase: Phase): boolean;
}

abstract class AbstractDiary implements IDiary {
    protected eventToMoment: Map<ClocktowerEvent, Moment>;

    protected tollRecorder: ITollRecorder;

    protected declare recordTollForExecution: RecordTollForExecution;

    protected declare recordTollForExile: RecordTollForExile;

    protected declare recordTollForDeath: RecordTollForDeath;

    protected declare recordTollForPhase: RecordTollForPhase;

    get execution(): IToll<Execution> | undefined {
        return this.recordTollForExecution.execution;
    }

    get exiles(): Array<IToll<Exile>> {
        return this.recordTollForExile.exiles;
    }

    get deaths(): Map<IPlayer, IToll<Death>> {
        return this.recordTollForDeath.deaths;
    }

    get phaseToMoment(): Map<Phase, IToll<Phase>> {
        return this.recordTollForPhase.phaseToMoment;
    }

    get hasExecution(): boolean {
        return this.execution !== undefined;
    }

    get hasExile(): boolean {
        return this.exiles.length > 0;
    }

    get executed(): IPlayer | undefined {
        return this.execution?.forWhat.executed;
    }

    constructor() {
        this.eventToMoment = new Map();
        this.tollRecorder = this.createTollRecorder();
    }

    record(event: ClocktowerEvent): IToll<ClocktowerEvent> {
        const moment = this.tryRecord(event);
        const toll = new Toll(event, moment);

        if (!this.tollRecorder.record(toll)) {
            throw new RecordUnknownEventInDiary(this, event, moment);
        }

        return toll;
    }

    getMoment(event: ClocktowerEvent): Moment | undefined {
        return this.eventToMoment.get(event);
    }

    hasDead(player: IPlayer): boolean {
        return this.deaths.has(player);
    }

    hasDiedAtNight(player: IPlayer): boolean {
        const death = this.deaths.get(player);

        if (death === undefined) {
            return false;
        }

        return this.isMomentAtNight(death.when);
    }

    hasRecorded(event: ClocktowerEvent): boolean {
        return this.eventToMoment.has(event);
    }

    isEventAtDay(event: ClocktowerEvent): boolean {
        const moment = this.getMoment(event);

        if (moment === undefined) {
            throw new EventNotExistInDate(event, this);
        }

        return this.isMomentAtDay(moment);
    }

    isEventAtNight(event: ClocktowerEvent): boolean {
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

    protected tryRecord(event: ClocktowerEvent): Moment {
        if (this.hasRecorded(event)) {
            throw new PastMomentRewrite(
                this,
                event,
                this.getMoment(event)!,
                moment()
            );
        }

        const newMoment = moment();
        this.eventToMoment.set(event, newMoment);

        return newMoment;
    }

    protected createTollRecorder(): ITollRecorder {
        const recorder = new TollRecorder();
        this.initializeTollRecorder(recorder);
        return recorder;
    }

    protected initializeTollRecorder(recorder: ITollRecorder): void {
        this.initializeRecordForExecution(recorder);
        this.initializeRecordForExile(recorder);
        this.initializeRecordForDeath(recorder);
        this.initializeRecordForPhase(recorder);
    }

    protected initializeRecordForExecution(recorder: ITollRecorder): void {
        this.recordTollForExecution = new RecordTollForExecution();
        recorder.register(this.recordTollForExecution);
    }

    protected initializeRecordForExile(recorder: ITollRecorder): void {
        this.recordTollForExile = new RecordTollForExile();
        recorder.register(this.recordTollForExile);
    }

    protected initializeRecordForDeath(recorder: ITollRecorder): void {
        this.recordTollForDeath = new RecordTollForDeath();
        recorder.register(this.recordTollForDeath);
    }

    protected initializeRecordForPhase(recorder: ITollRecorder): void {
        this.recordTollForPhase = new RecordTollForPhase();
        recorder.register(this.recordTollForPhase);
    }
}

export class Diary extends AbstractDiary {}
