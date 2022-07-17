import { Character } from './character';
import { CharacterType, Minion, Outsider, Townsfolk } from './charactertype';
import { MinionPlayer, DemonPlayer, Player } from './player';
import { Generator } from './collections';
import { GameInfo } from './gameinfo';
import { Players } from './players';
import { Washerwoman } from '~/content/characters/output/washerwoman';
import { Librarian } from '~/content/characters/output/librarian';
import { Investigator } from '~/content/characters/output/investigator';

/**
 * {@link `glossary["Demon Info"]`}
 * Shorthand on the night sheet, representing the information that the Demon receives on the first night if there are 7 or more players. The Demon learns which players are the Minions, and learns 3 good characters that are not in play to help them bluff.
 */
export interface DemonInfo {
    minions: Array<MinionPlayer>;
    notInPlayGoodCharacters: [Character, Character, Character];
}

/**
 * {@link `glossary["Minion info"]`}
 * Shorthand on the night sheet, representing the information that the Minions receive on the first night if there are 7 or more players. The Minions learn which other players are Minions, and which player the Demon is.
 */
export interface MinionInfo {
    minions: Array<MinionPlayer>;
    demon: Array<DemonPlayer>;
}

export abstract class InfoProvider<T> {
    constructor(readonly receiver: Player, readonly isTrue: boolean) {
        this.receiver = receiver;
        this.isTrue = isTrue;
    }

    abstract trueInfoCandidates(gameInfo: GameInfo): Generator<T>;
    abstract falseInfoCandidates(gameInfo: GameInfo): Generator<T>;

    candidates(gameInfo: GameInfo): Generator<T> {
        return this.isTrue
            ? this.trueInfoCandidates(gameInfo)
            : this.falseInfoCandidates(gameInfo);
    }
}

interface OneCharacterForTwoPlayers {
    players: [Player, Player];
    character: typeof Character;
}

abstract class OneCharacterForTwoPlayersInfoProvider<
    TInfo extends Partial<OneCharacterForTwoPlayers>,
    TCharacter
> extends InfoProvider<TInfo> {
    declare receiver: Player & { character: TCharacter };

    protected abstract expectedCharacterType: typeof CharacterType;

    trueInfoCandidates(gameInfo: GameInfo) {
        const infoCandidates = gameInfo.players
            .isNot(this.receiver)
            .isCharacterType(this.expectedCharacterType)
            .map((player) =>
                Generator.once([player])
                    .cartesian_product(
                        gameInfo.players.exclude([this.receiver, player])
                    )
                    .map(
                        (players) =>
                            ({
                                players,
                                character: player.character,
                            } as TInfo)
                    )
            );

        return Generator.once(
            Generator.chain_from_iterable<TInfo>(infoCandidates)
        );
    }

    falseInfoCandidates(gameInfo: GameInfo) {
        const playersCandidates = gameInfo.players
            .isNot(this.receiver)
            .combinations(2);
        return playersCandidates
            .cartesian_product(
                gameInfo.characterSheet.getCharactersByType(
                    this.expectedCharacterType
                )
            )
            .map(([players, character]) => ({ players, character } as TInfo));
    }
}

export interface WasherwomanInfo extends OneCharacterForTwoPlayers {}

export class WasherwomanInfoProvider extends OneCharacterForTwoPlayersInfoProvider<
    WasherwomanInfo,
    typeof Washerwoman
> {
    protected expectedCharacterType: typeof CharacterType = Townsfolk;
}

export interface LibrarianInfo extends Partial<OneCharacterForTwoPlayers> {
    hasOutsider: boolean;
    players?: [Player, Player];
    character?: typeof Character;
}

export class LibrarianInfoProvider extends OneCharacterForTwoPlayersInfoProvider<
    LibrarianInfo,
    typeof Librarian
> {
    static readonly noOutsiderLibrarianInfo: LibrarianInfo = {
        hasOutsider: false,
    };

    protected expectedCharacterType: typeof CharacterType = Outsider;

    trueInfoCandidates(gameInfo: GameInfo) {
        return super
            .trueInfoCandidates(gameInfo)
            .map((librarianInfo) => {
                librarianInfo.hasOutsider = true;
                return librarianInfo;
            })
            .orElse(LibrarianInfoProvider.noOutsiderLibrarianInfo);
    }

    falseInfoCandidates(gameInfo: GameInfo) {
        return super
            .falseInfoCandidates(gameInfo)
            .orElse(LibrarianInfoProvider.noOutsiderLibrarianInfo);
    }
}

export interface InvestigatorInfo extends OneCharacterForTwoPlayers {}

export class InvestigatorInfoProvider extends OneCharacterForTwoPlayersInfoProvider<
    InvestigatorInfo,
    typeof Investigator
> {
    protected expectedCharacterType: typeof CharacterType = Minion;
}

export interface ChefInfo {
    numPairEvilPlayers: number;
}

export class ChefInfoProvider extends InfoProvider<ChefInfo> {
    trueInfoCandidates(gameInfo: GameInfo) {
        const numPairEvilPlayers = Generator.reduce(
            (numEvilNeighbors, neighbor) =>
                numEvilNeighbors + (Players.allEvil(neighbor) ? 1 : 0),
            0,
            gameInfo.players.getNeighbors()
        );

        return Generator.once([
            {
                numPairEvilPlayers,
            },
        ]);
    }

    falseInfoCandidates(gameInfo: GameInfo) {
        const numEvilPlayers = Generator.reduce(
            (numEvilPlayers, player) =>
                numEvilPlayers + (player.isEvil ? 1 : 0),
            0,
            gameInfo.players
        );
        return Generator.once(
            Generator.map(
                (numPairEvilPlayers) => ({ numPairEvilPlayers }),
                Generator.range(0, numEvilPlayers)
            )
        );
    }
}
