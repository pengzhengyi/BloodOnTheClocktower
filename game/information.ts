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
import { Generator } from './collections';
import type { CharacterToken } from './character';
import type {
    CharacterType,
    Demon,
    Minion,
    Outsider,
    Townsfolk,
} from './charactertype';
import { MinionPlayer, Player } from './player';
import { GAME_UI } from '~/interaction/gameui';

/**
 * There are two classifications for info:
 *
 * - Subjective: good info and bad info where good info is helpful to its receiver while bad info misleading
 * - Objective: true info and false info depending on whether the ability malfunctions
 *
 * {@link `glossary["True info"]`}
 * True information, such as a true statement, gesture, or character token. The Storyteller must always give true information about the rules. See False info.
 *
 * {@link `glossary["False info"]`}
 * False information, such as a false statement, gesture, or character token. The Storyteller may give false information when an ability malfunctions, such as when the player is drunk or poisoned. See True info.
 *
 * However, there are some cases where these classifications becomes a little unintuitive.
 *
 *  @example {@link `spy["gameplay"][0]`}
 * The Washerwoman learns that either Abdallah or Douglas is the Ravenkeeper. Abdallah is the Monk, and Douglas is the Spy registering as the Ravenkeeper.
 *
 * In this example, Washerwoman's ability does not malfunction, so the washerwoman player gets true but misleading info.
 *
 * There is yet one other special genre of information: storyteller information. It is both true and good info as it is the actual information. For example, spy can see the Grimoire, so it has access to storyteller information.
 */
export abstract class Info<T> {
    readonly info: T;

    constructor(info: T) {
        this.info = info;
    }

    send(player: Player, reason?: string): Promise<void> {
        return GAME_UI.send(player, this, reason);
    }
}

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

export class StoryTellerInformation<T> extends Info<T> {}

export interface OneOfTwoPlayersHasCharacterType {
    players: [Player, Player];
    character: CharacterToken;
    characterType: typeof CharacterType;
}

/**
 * {@link `glossary["Demon Info"]`}
 * Shorthand on the night sheet, representing the information that the Demon receives on the first night if there are 7 or more players. The Demon learns which players are the Minions, and learns 3 good characters that are not in play to help them bluff.
 */
export interface DemonInformation {
    minions: Array<MinionPlayer>;
    notInPlayGoodCharacters: [CharacterToken, CharacterToken, CharacterToken];
}

export type TrueInformation<T> = Information<T> & { isTrueInfo: true };
export type FalseInformation<T> = Information<T> & { isTrueInfo: false };
export type TrueInformationOptions<T> =
    | Generator<TrueInformation<T>>
    | Generator<never>;
export type FalseInformationOptions<T> =
    | Generator<FalseInformation<T>>
    | Generator<never>;
export type StoryTellerInformationOptions<T> =
    | Generator<StoryTellerInformation<T>>
    | Generator<never>;
export type InfoOptions<T> =
    | TrueInformationOptions<T>
    | FalseInformationOptions<T>
    | StoryTellerInformationOptions<T>;

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

export type WasherwomanInformation = OneOfTwoPlayersIsTownsfolk;

export type LibrarianNoOutsiderInformation = {
    noOutsiders: true;
};
export type LibrarianInformation =
    | OneOfTwoPlayersIsOutsider
    | LibrarianNoOutsiderInformation;

export type InvestigatorInformation = OneOfTwoPlayersIsMinion;

export interface ChefInformation {
    numPairEvilPlayers: number;
}

/**
 * {@link `empath["ability"]`}
 * "Each night, you learn how many of your 2 alive neighbours are evil."
 */
export interface EmpathInformation {
    numEvilAliveNeighbors: 0 | 1 | 2;
}

/**
 * {@link `fortuneteller["ability"]`}
 * "Each night, choose 2 players: you learn if either is a Demon. There is a good player that registers as a Demon to you."
 */
export interface FortuneTellerInformation {
    players: [Player, Player];
    hasDemon: boolean;
}
