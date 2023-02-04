import type { CharacterToken } from '../character/character';
import type {
    Townsfolk,
    Outsider,
    Minion,
    Demon,
    CharacterType,
} from '../character/character-type';
import type { Generator } from '../collections';
import type { IPlayer } from '../player';
import { Info } from './info';

/**
 * Information is sent by storyteller to the player.
 *
 * In implementation, there are two roles:
 *
 * - InfoRequester: An agent that prompts for information at necessary moments.
 * - InfoProvider: A consultant that generates information options for storyteller to choose from.
 *
 *
 *  Player     InfoRequester     Storyteller     InfoProvider
 *    |               |-----PROMPT----->|              |
 *    |               |                 |----CONSULT-->|
 *    |               |                 |<---OPTIONS---|
 *    |               |<------INFO------|              |
 *    |<-----INFO-----|                 |              |
 */

export class Information<T> extends Info<T> {
    static true<T>(info: T): Information<T> & { isTrueInfo: true } {
        return new this(info, true) as Information<T> & { isTrueInfo: true };
    }

    static false<T>(info: T): Information<T> & { isTrueInfo: false } {
        return new this(info, false) as Information<T> & { isTrueInfo: false };
    }

    readonly isTrueInfo: boolean;

    get isFalseInfo(): boolean {
        return !this.isTrueInfo;
    }

    constructor(info: T, isTrueInfo: boolean) {
        super(info);
        this.isTrueInfo = isTrueInfo;
    }
}

export type TrueInformation<T> = Information<T> & { isTrueInfo: true };
export type FalseInformation<T> = Information<T> & { isTrueInfo: false };
export type TrueInformationOptions<T> =
    | Generator<TrueInformation<T>>
    | Generator<never>;
export type FalseInformationOptions<T> =
    | Generator<FalseInformation<T>>
    | Generator<never>;

export interface OneOfTwoPlayersHasCharacterType {
    players: [IPlayer, IPlayer];
    character: CharacterToken;
    characterType: typeof CharacterType;
}

export type OneOfTwoPlayersIsTownsfolk = OneOfTwoPlayersHasCharacterType & {
    characterType: Townsfolk;
};

export type OneOfTwoPlayersIsOutsider = OneOfTwoPlayersHasCharacterType & {
    characterType: Outsider;
};

export type OneOfTwoPlayersIsMinion = OneOfTwoPlayersHasCharacterType & {
    characterType: Minion;
};

export type OneOfTwoPlayersIsDemon = OneOfTwoPlayersHasCharacterType & {
    characterType: Demon;
};
