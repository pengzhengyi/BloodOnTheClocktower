/* eslint-disable no-dupe-class-members */
import {
    ChangeType,
    type ICharacterTypeChange,
    type ICharacterTypeChangeEvent,
} from '../event/character-type-change';
import type { IEvent, IEventCategory } from '../types';
import { Demon } from '~/game/character-type';
import { Singleton } from '~/game/common';

export interface ICharacterTypeChangeCategory extends IEventCategory {}

abstract class AbstractCharacterTypeChangeCategory
    implements ICharacterTypeChangeCategory
{
    declare static readonly changeType: ICharacterTypeChange['changeType'];

    declare static readonly characterType: ICharacterTypeChange['characterType'];

    get changeType(): ICharacterTypeChange['changeType'] {
        return (this.constructor as any).changeType;
    }

    get characterType(): ICharacterTypeChange['characterType'] {
        return (this.constructor as any).characterType;
    }

    has(event: Exclude<IEvent, ICharacterTypeChangeEvent>): false;

    has(event: ICharacterTypeChangeEvent): boolean;

    has(event: IEvent): boolean {
        if ('characterTypeChange' in event) {
            const characterTypeChange = (event as ICharacterTypeChangeEvent)
                .characterTypeChange;
            return (
                characterTypeChange.changeType === this.changeType &&
                characterTypeChange.characterType === this.characterType
            );
        } else {
            return false;
        }
    }
}

class BaseBecomeDemonCategory extends AbstractCharacterTypeChangeCategory {
    static readonly changeType = ChangeType.Become;
    static readonly characterType = Demon;
}

export const BecomeDemonCategory = Singleton<BaseBecomeDemonCategory>(
    BaseBecomeDemonCategory
);

class BaseLoseDemonCategory extends AbstractCharacterTypeChangeCategory {
    static readonly changeType = ChangeType.Lose;
    static readonly characterType = Demon;
}

export const LoseDemonCategory = Singleton<BaseLoseDemonCategory>(
    BaseLoseDemonCategory
);
