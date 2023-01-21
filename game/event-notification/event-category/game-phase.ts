/* eslint-disable no-dupe-class-members */
import type { IGamePhaseEvent } from '../event/game-phase';
import type { IEvent, IEventCategory } from '../types';
import { Phase } from '~/game/phase';

export interface IGamePhaseCategory extends IEventCategory {}

abstract class AbstractGamePhaseCategory implements IGamePhaseCategory {
    declare static readonly phase: Phase;

    get phase(): Phase {
        return (this.constructor as any).phase;
    }

    has(event: Exclude<IEvent, IGamePhaseEvent>): false;

    has(event: IGamePhaseEvent): boolean;

    has(event: IEvent): boolean {
        if ('gamePhase' in event) {
            return (event as IGamePhaseEvent).gamePhase.phase === this.phase;
        } else {
            return false;
        }
    }
}

export class SetupPhaseCategory extends AbstractGamePhaseCategory {
    static readonly phase = Phase.Setup;
}

export class NightPhaseCategory extends AbstractGamePhaseCategory {
    static readonly phase = Phase.Night;
}

export class DawnPhaseCategory extends AbstractGamePhaseCategory {
    static readonly phase = Phase.Dawn;
}

export class DayPhaseCategory extends AbstractGamePhaseCategory {
    static readonly phase = Phase.Day;
}

export class DuskPhaseCategory extends AbstractGamePhaseCategory {
    static readonly phase = Phase.Dusk;
}

export class GameEndPhaseCategory extends AbstractGamePhaseCategory {
    static readonly phase = Phase.GameEnd;
}
