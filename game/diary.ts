import { Death } from './death';
import {
    EventNotExistInDate,
    PastMomentRewrite,
    RecordUnknownEventInDiary,
} from './exception';
import { Execution } from './execution';
import { Exile } from './exile';
import { moment, type Moment } from './moment';
import { isPhase, Phase } from './phase';
import type { IPlayer } from './player';
import { type IToll, Toll } from './toll';

type MomentQuery =
    | 'isSameOrBefore'
    | 'isSameOrAfter'
    | 'isBefore'
    | 'isSame'
    | 'isAfter';

export type Event = Execution | Exile | Phase | Death;

/**
 * A diary records important events within a date.
 */
export interface IDiary {
    execution: IToll<Execution> | undefined;
    exiles: Array<IToll<Exile>>;
    deaths: Map<IPlayer, IToll<Death>>;
    phaseToMoment: Map<Phase, IToll<Phase>>;
    hasExecution: boolean;
    hasExile: boolean;
    executed: IPlayer | undefined;

    record(event: Event): IToll<Event>;
    getMoment(event: Event): Moment | undefined;
    hasDead(player: IPlayer): boolean;
    hasDiedAtNight(player: IPlayer): boolean;
    hasRecorded(event: Event): boolean;
    isEventAtDay(event: Event): boolean;
    isEventAtNight(event: Event): boolean;
    isMomentAtDay(moment: Moment): boolean;
    isMomentAtNight(moment: Moment): boolean;
    isMomentBeforePhase(moment: Moment, phase: Phase): boolean;
    isMomentSameOrBeforePhase(moment: Moment, phase: Phase): boolean;
    isMomentAfterPhase(moment: Moment, phase: Phase): boolean;
    isMomentSameOrAfterPhase(moment: Moment, phase: Phase): boolean;
}

abstract class AbstractDiary implements IDiary {
    execution: IToll<Execution> | undefined;

    exiles: Array<IToll<Exile>> = [];

    deaths: Map<IPlayer, IToll<Death>> = new Map();

    phaseToMoment: Map<Phase, IToll<Phase>> = new Map();

    protected eventToMoment: Map<Event, Moment> = new Map();

    get hasExecution(): boolean {
        return this.execution !== undefined;
    }

    get hasExile(): boolean {
        return this.exiles.length > 0;
    }

    get executed(): IPlayer | undefined {
        return this.execution?.forWhat.executed;
    }

    record(event: Event): IToll<Event> {
        const moment = this.tryRecord(event);
        const toll = new Toll(event, moment);

        if (event instanceof Execution) {
            return (this.execution = toll as IToll<Execution>);
        } else if (event instanceof Exile) {
            this.exiles.push(toll as IToll<Exile>);
            return toll;
        } else if (event instanceof Death) {
            this.deaths.set(event.player, toll as IToll<Death>);
            return toll;
        } else if (isPhase(event)) {
            this.phaseToMoment.set(event, toll as IToll<Phase>);
            return toll;
        }

        throw new RecordUnknownEventInDiary(this, event, moment);
    }

    getMoment(event: Event): Moment | undefined {
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
                moment()
            );
        }

        const newMoment = moment();
        this.eventToMoment.set(event, newMoment);

        return newMoment;
    }
}

export class Diary extends AbstractDiary {}
