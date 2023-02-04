import type { IEvent } from '../types';
import { type IPlayer } from '~/game/player';
import { type CharacterType, Demon } from '~/game/character-type';
import { PlayerCharacterTypeBecomeUndefined } from '~/game/exception';

export enum ChangeType {
    Become,
    Lose,
}
export interface ICharacterTypeChange {
    changeType: ChangeType;
    characterType: typeof CharacterType;
}

interface WithCharacterTypeChange {
    readonly characterTypeChange: ICharacterTypeChange;
}

export interface ICharacterTypeChangeEvent
    extends IEvent,
        WithCharacterTypeChange {
    readonly previousCharacterType: typeof CharacterType;
    readonly newCharacterType: typeof CharacterType;
    readonly affectedPlayer: IPlayer;
    readonly reason?: string;
}

abstract class CharacterTypeChangeEvent implements ICharacterTypeChangeEvent {
    readonly previousCharacterType: typeof CharacterType;
    readonly newCharacterType: typeof CharacterType;
    readonly affectedPlayer: IPlayer;
    readonly reason?: string;
    readonly characterTypeChange: ICharacterTypeChange;

    constructor(
        affectedPlayer: IPlayer,
        previousCharacterType: typeof CharacterType,
        newCharacterType: typeof CharacterType,
        characterTypeChange: ICharacterTypeChange,
        reason?: string
    ) {
        this.affectedPlayer = affectedPlayer;
        this.previousCharacterType = previousCharacterType;
        this.newCharacterType = newCharacterType;
        this.characterTypeChange = characterTypeChange;
        this.reason = reason;
    }

    toString(): string {
        const changeType =
            this.characterTypeChange.changeType === ChangeType.Become
                ? 'becomes'
                : 'is no longer';
        const reason =
            this.reason === undefined ? '' : ` because ${this.reason}`;
        return `Player ${this.affectedPlayer} ${changeType} Demon${reason}`;
    }
}

const BecomeDemon: ICharacterTypeChange = {
    changeType: ChangeType.Become,
    characterType: Demon,
};

export class BecomeDemonEvent extends CharacterTypeChangeEvent {
    constructor(
        affectedPlayer: IPlayer,
        previousCharacterType: typeof CharacterType,
        reason?: string
    ) {
        super(
            affectedPlayer,
            previousCharacterType,
            Demon,
            BecomeDemon,
            reason
        );
    }
}

const LoseDemon: ICharacterTypeChange = {
    changeType: ChangeType.Lose,
    characterType: Demon,
};

export class LoseDemonEvent extends CharacterTypeChangeEvent {
    constructor(
        affectedPlayer: IPlayer,
        newCharacterType: typeof CharacterType,
        reason?: string
    ) {
        super(affectedPlayer, Demon, newCharacterType, LoseDemon, reason);
    }
}

export abstract class CharacterTypeChangeEventFactory {
    static getCharacterTypeChangeEvent(
        affectedPlayer: IPlayer,
        previousCharacterType?: typeof CharacterType,
        newCharacterType?: typeof CharacterType,
        reason?: string
    ): Array<ICharacterTypeChangeEvent> {
        if (previousCharacterType === undefined) {
            return [];
        }

        if (newCharacterType === undefined) {
            throw new PlayerCharacterTypeBecomeUndefined(
                affectedPlayer,
                previousCharacterType,
                newCharacterType,
                reason
            );
        }

        if (previousCharacterType === newCharacterType) {
            return [];
        }

        const events = [];

        const becomeCharacterTypeChangeEvent =
            this.getBecomeCharacterTypeChangeEvent(
                affectedPlayer,
                previousCharacterType,
                newCharacterType,
                reason
            );
        if (becomeCharacterTypeChangeEvent !== undefined) {
            events.push(becomeCharacterTypeChangeEvent);
        }

        const loseCharacterTypeChangeEvent =
            this.getLoseCharacterTypeChangeEvent(
                affectedPlayer,
                previousCharacterType,
                newCharacterType,
                reason
            );
        if (loseCharacterTypeChangeEvent !== undefined) {
            events.push(loseCharacterTypeChangeEvent);
        }

        return events;
    }

    protected static getBecomeCharacterTypeChangeEvent(
        affectedPlayer: IPlayer,
        previousCharacterType: typeof CharacterType,
        newCharacterType: typeof CharacterType,
        reason?: string
    ): ICharacterTypeChangeEvent | undefined {
        switch (newCharacterType) {
            case Demon:
                return new BecomeDemonEvent(
                    affectedPlayer,
                    previousCharacterType,
                    reason
                );
        }
    }

    protected static getLoseCharacterTypeChangeEvent(
        affectedPlayer: IPlayer,
        previousCharacterType: typeof CharacterType,
        newCharacterType: typeof CharacterType,
        reason?: string
    ): ICharacterTypeChangeEvent | undefined {
        switch (previousCharacterType) {
            case Demon:
                return new LoseDemonEvent(
                    affectedPlayer,
                    newCharacterType,
                    reason
                );
        }
    }
}
