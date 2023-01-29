/* eslint-disable @typescript-eslint/no-redeclare */
/* eslint-disable no-dupe-class-members */
import type { IGamePhaseEvent } from '../event/game-phase';
import type { IEvent, IEventCategory } from '../types';
import { Phase } from '~/game/phase';
import { Singleton } from '~/game/common';
import type { RequirePhase } from '~/game/types';

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

class BaseSetupPhaseCategory extends AbstractGamePhaseCategory {
    static readonly phase = Phase.Setup;
}

export const SetupPhaseCategory = Singleton<
    BaseSetupPhaseCategory,
    typeof BaseSetupPhaseCategory
>(BaseSetupPhaseCategory);

class BaseNightPhaseCategory extends AbstractGamePhaseCategory {
    static readonly phase = Phase.Night;
}

export interface NightPhaseCategory extends RequirePhase {}
export const NightPhaseCategory = Singleton<
    BaseNightPhaseCategory,
    typeof BaseNightPhaseCategory
>(BaseNightPhaseCategory);

class BaseDawnPhaseCategory extends AbstractGamePhaseCategory {
    static readonly phase = Phase.Dawn;
}
export interface DawnPhaseCategory extends RequirePhase {}
export const DawnPhaseCategory = Singleton<
    BaseDawnPhaseCategory,
    typeof BaseDawnPhaseCategory
>(BaseDawnPhaseCategory);

class BaseDayPhaseCategory extends AbstractGamePhaseCategory {
    static readonly phase = Phase.Day;
}
export interface DayPhaseCategory extends RequirePhase {}
export const DayPhaseCategory = Singleton<
    BaseDayPhaseCategory,
    typeof BaseDayPhaseCategory
>(BaseDayPhaseCategory);

class BaseDuskPhaseCategory extends AbstractGamePhaseCategory {
    static readonly phase = Phase.Dusk;
}
export interface DuskPhaseCategory extends RequirePhase {}
export const DuskPhaseCategory = Singleton<
    BaseDuskPhaseCategory,
    typeof BaseDuskPhaseCategory
>(BaseDuskPhaseCategory);

class BaseGameEndPhaseCategory extends AbstractGamePhaseCategory {
    static readonly phase = Phase.GameEnd;
}
export interface GameEndPhaseCategory extends RequirePhase {}
export const GameEndPhaseCategory = Singleton<
    BaseGameEndPhaseCategory,
    typeof BaseGameEndPhaseCategory
>(BaseGameEndPhaseCategory);
