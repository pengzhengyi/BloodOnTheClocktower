import type { IEvent } from '../types';
import { IPlayer } from '~/game/player';
import { CharacterType, Demon } from '~/game/character-type';

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
        previousCharacterType: typeof CharacterType,
        reason?: string
    ) {
        super(affectedPlayer, previousCharacterType, Demon, LoseDemon, reason);
    }
}
