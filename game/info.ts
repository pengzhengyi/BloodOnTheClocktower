import { Character } from './character';
import { CharacterType, Minion, Outsider, Townsfolk } from './charactertype';
import { MinionPlayer, DemonPlayer, Player } from './player';
import { Generator } from './collections';
import { FortuneTellerChooseInvalidPlayers } from './exception';
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

    async trueInfoCandidates(gameInfo: GameInfo) {
        return await this._trueInfoCandidates(gameInfo);
    }

    async falseInfoCandidates(gameInfo: GameInfo) {
        return await this._falseInfoCandidates(gameInfo);
    }

    protected _trueInfoCandidates(_gameInfo: GameInfo): Generator<T> {
        throw new Error('Method not implemented.');
    }

    protected _falseInfoCandidates(_gameInfo: GameInfo): Generator<T> {
        throw new Error('Method not implemented.');
    }

    candidates(gameInfo: GameInfo): Promise<Generator<T>> {
        return this.isTrue
            ? this.trueInfoCandidates(gameInfo).catch((_) =>
                  Generator<T>.empty()
              )
            : this.falseInfoCandidates(gameInfo).catch((_) =>
                  Generator<T>.empty()
              );
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

    protected _trueInfoCandidates(gameInfo: GameInfo) {
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

    protected _falseInfoCandidates(gameInfo: GameInfo) {
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

    _trueInfoCandidates(gameInfo: GameInfo) {
        return super
            ._trueInfoCandidates(gameInfo)
            .map((librarianInfo) => {
                librarianInfo.hasOutsider = true;
                return librarianInfo;
            })
            .orElse(LibrarianInfoProvider.noOutsiderLibrarianInfo);
    }

    _falseInfoCandidates(gameInfo: GameInfo) {
        return super
            ._falseInfoCandidates(gameInfo)
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
    async trueInfoCandidates(gameInfo: GameInfo) {
        let numPairEvilPlayers = 0;

        for await (const neighbor of gameInfo.players.getNeighbors()) {
            if (Players.allEvil(neighbor)) {
                numPairEvilPlayers++;
            }
        }

        return Generator.once([
            {
                numPairEvilPlayers,
            },
        ]);
    }

    _falseInfoCandidates(gameInfo: GameInfo) {
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

/**
 * {@link `empath["ability"]`}
 * "Each night, you learn how many of your 2 alive neighbours are evil."
 */
export interface EmpathInfo {
    numEvilAliveNeighbors: 0 | 1 | 2;
}

export class EmpathInfoProvider extends InfoProvider<EmpathInfo> {
    async trueInfoCandidates(gameInfo: GameInfo) {
        const seating = await gameInfo.getSeating();
        const aliveNeighbors = await seating.getAliveNeighbors(this.receiver);
        const numEvilAliveNeighbors = Generator.reduce(
            (count, neighbor) => count + (neighbor.isEvil ? 1 : 0),
            0,
            aliveNeighbors
        );

        return Generator.once([
            {
                numEvilAliveNeighbors,
            } as EmpathInfo,
        ]);
    }

    _falseInfoCandidates(_gameInfo: GameInfo) {
        return Generator.once(
            [0, 1, 2].map(
                (numEvilAliveNeighbors) =>
                    ({ numEvilAliveNeighbors } as EmpathInfo)
            )
        );
    }
}

/**
 * {@link `fortuneteller["ability"]`}
 * "Each night, choose 2 players: you learn if either is a Demon. There is a good player that registers as a Demon to you."
 */
export interface FortuneTellerInfo {
    players?: [Player, Player];
    hasDemon: boolean;
}

export class FortuneTellerInfoProvider extends InfoProvider<FortuneTellerInfo> {
    protected chosenPlayers?: [Player, Player];

    get chosen(): [Player, Player] | undefined {
        return this.chosenPlayers;
    }

    static isChoiceValid(players: Array<Player> | undefined): boolean {
        return Array.isArray(players) && players.length === 2;
    }

    choose(players: Array<Player> | undefined) {
        if (FortuneTellerInfoProvider.isChoiceValid(players)) {
            this.chosenPlayers = players as [Player, Player];
        } else {
            throw new FortuneTellerChooseInvalidPlayers(players);
        }
    }

    async getChosenPlayers(gameInfo: GameInfo): Promise<Players> {
        if (this.chosenPlayers?.length !== 2) {
            const error = new FortuneTellerChooseInvalidPlayers(
                this.chosenPlayers
            );
            await error.resolve();
            this.chosenPlayers = error.corrected;
        }

        return gameInfo.players.intersect(this.chosenPlayers);
    }

    async trueInfoCandidates(gameInfo: GameInfo) {
        const chosenPlayers = await this.getChosenPlayers(gameInfo);

        return Generator.once([
            {
                players: Array.from(chosenPlayers),
                hasDemon: Generator.any(
                    (player) => player.isDemon,
                    chosenPlayers
                ),
            } as FortuneTellerInfo,
        ]);
    }

    _falseInfoCandidates(_gameInfo: GameInfo) {
        return Generator.once([
            {
                players: this.chosenPlayers,
                hasDemon: true,
            } as FortuneTellerInfo,
            {
                players: this.chosenPlayers,
                hasDemon: false,
            } as FortuneTellerInfo,
        ]);
    }
}

/**
 * {@link `undertaker["ability"]`}
 * "Each night*, you learn which character died by execution today."
 */
export interface UndertakerInfo {
    player: Player;
    character: typeof Character;
}

export class UndertakerInfoProvider extends InfoProvider<UndertakerInfo> {
    _trueInfoCandidates(gameInfo: GameInfo) {
        const executed = gameInfo.executed;

        if (executed === undefined) {
            return Generator.empty<UndertakerInfo>();
        } else {
            return Generator.once([
                {
                    player: executed,
                    character: executed.character,
                } as UndertakerInfo,
            ]);
        }
    }

    _falseInfoCandidates(gameInfo: GameInfo) {
        const executed = gameInfo.executed;

        if (executed === undefined) {
            return Generator.empty<UndertakerInfo>();
        } else {
            return Generator.once(gameInfo.characterSheet.characters).map(
                (character) => ({
                    player: executed,
                    character,
                })
            );
        }
    }
}

/**
 * {@link `ravenkeeper["ability"]`}
 * "If you die at night, you are woken to choose a player: you learn their character."
 */
export interface RavenkeeperInfo {
    player: Player;
    character: typeof Character;
}

export class RavenkeeperInfoProvider extends InfoProvider<RavenkeeperInfo> {
    protected chosenPlayerId?: string;

    getChosenPlayer(gameInfo: GameInfo): Player | undefined {
        return gameInfo.getInfluencedPlayer(this.chosenPlayerId);
    }

    choosePlayer(player: Player) {
        this.chosenPlayerId = player.id;
    }

    _trueInfoCandidates(gameInfo: GameInfo) {
        const chosen = this.getChosenPlayer(gameInfo);

        if (chosen === undefined) {
            return Generator.empty<RavenkeeperInfo>();
        } else {
            return Generator.once([
                {
                    player: chosen,
                    character: chosen.character,
                } as RavenkeeperInfo,
            ]);
        }
    }

    _falseInfoCandidates(gameInfo: GameInfo) {
        const chosen = this.getChosenPlayer(gameInfo);

        if (chosen === undefined) {
            return Generator.empty<RavenkeeperInfo>();
        } else {
            return Generator.once(gameInfo.characterSheet.characters).map(
                (character) => ({
                    player: chosen,
                    character,
                })
            );
        }
    }
}
