/** @deprecated */

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

import type { Character, CharacterToken } from './character';
import { CharacterType, Minion, Outsider, Townsfolk } from './charactertype';
import type { MinionPlayer, DemonPlayer, Player } from './player';
import { Generator } from './collections';
import type { GameInfo } from './gameinfo';
import { Players } from './players';
import { Context, InfoProcessor } from './infoprocessor';
import { Phase } from './gamephase';
import { Washerwoman } from '~/content/characters/output/washerwoman';
import { Librarian } from '~/content/characters/output/librarian';
import { Investigator } from '~/content/characters/output/investigator';
import { GAME_UI } from '~/interaction/gameui';
import { Ravenkeeper } from '~/content/characters/output/ravenkeeper';
import { Undertaker } from '~/content/characters/output/undertaker';
import { Fortuneteller } from '~/content/characters/output/fortuneteller';
import { Empath } from '~/content/characters/output/empath';
import { Chef } from '~/content/characters/output/chef';

/**
 * A consultant that generates information options for storyteller to choose from.
 */
export abstract class InfoProvider<T> {
    /**
     * Sentinel value to signal information available but not provided.
     *
     * This usually happens when player fail to respond to some required actions like choosing another player.
     */
    static EMPTY_INFO = Generator.cache([{}]);

    /**
     * Sentinel value to signal no options exist for information.
     *
     * This usually happens when some conditions for a character's ability
     * are not satisfied and the player with that character is not eligible
     * to receive information.
     */
    static NO_INFO = Generator.cache([]);

    readonly targetPlayer: Player;

    isTrue: boolean;

    constructor(targetPlayer: Player, isTrue: boolean) {
        this.targetPlayer = targetPlayer;
        this.isTrue = isTrue;
    }

    async trueInfoCandidates(gameInfo: GameInfo) {
        return await this._trueInfoCandidates(gameInfo);
    }

    async falseInfoCandidates(gameInfo: GameInfo) {
        return await this._falseInfoCandidates(gameInfo);
    }

    protected _trueInfoCandidates(
        _gameInfo: GameInfo
    ): Generator<T> | Generator<never> {
        throw new Error('Method not implemented.');
    }

    protected _falseInfoCandidates(
        _gameInfo: GameInfo
    ): Generator<T> | Generator<never> {
        throw new Error('Method not implemented.');
    }

    candidates(gameInfo: GameInfo): Promise<Generator<T> | Generator<never>> {
        return this.isTrue
            ? this.trueInfoCandidates(gameInfo).catch((_) => Generator.empty())
            : this.falseInfoCandidates(gameInfo).catch((_) =>
                  Generator.empty()
              );
    }
}

/**
 * An agent that prompts for information at necessary moments.
 */
export abstract class InfoRequester<T, TInfoProvider extends InfoProvider<T>>
    implements InfoProcessor
{
    static from(character: CharacterToken) {
        switch (character) {
            case Washerwoman:
                return WasherwomanInfoRequester;
            case Librarian:
                return LibrarianInfoRequester;
            case Investigator:
                return InvestigatorInfoRequester;
            case Chef:
                return ChefInfoRequester;
            case Empath:
                return EmpathInfoRequester;
            case Fortuneteller:
                return FortuneTellerInfoRequester;
            case Undertaker:
                return UndertakerInfoRequester;
            case Ravenkeeper:
                return RavenkeeperInfoRequester;
            default:
                return undefined;
        }
    }

    static of(player: Player) {
        const InfoRequesterClass = this.from(player.character);

        if (InfoRequesterClass === undefined) {
            return undefined;
        }

        return new InfoRequesterClass(player, true);
    }

    get description() {
        return `${this.targetPlayer} needs game information`;
    }

    get targetPlayer() {
        return this.infoProvider.targetPlayer;
    }

    get willGetTrueInfo() {
        return this.infoProvider.isTrue;
    }

    abstract applicablePhases: number | Phase;

    declare infoProvider: TInfoProvider;

    abstract isEligible(gameInfo: GameInfo): Promise<boolean>;

    /**
     * Requesting character-relevant information based on game information. The information
     */
    async apply(gameInfo: GameInfo, context: Context): Promise<GameInfo> {
        if (await this.isEligible(gameInfo)) {
            return await this._apply(gameInfo, context);
        } else {
            return gameInfo;
        }
    }

    protected async _apply(
        gameInfo: GameInfo,
        _context: Context
    ): Promise<GameInfo> {
        const candidates = await this.getCandidates(gameInfo);
        const reason = this.description;

        const selected = await GAME_UI.storytellerChoose(
            candidates,
            1,
            reason,
            true
        );
        if (selected !== undefined) {
            await GAME_UI.send(this.targetPlayer, selected, reason);
        }

        return gameInfo;
    }

    async getCandidates(gameInfo: GameInfo) {
        const player = await gameInfo.getPlayer(this.targetPlayer);
        this.infoProvider.isTrue = !player.willGetFalseInfo;
        return await this.infoProvider.candidates(gameInfo);
    }
}

abstract class OnceInfoRequester<
    T,
    TInfoProvider extends InfoProvider<T>
> extends InfoRequester<T, TInfoProvider> {
    hasReceivedInfo = false;

    async isEligible(_gameInfo: GameInfo): Promise<boolean> {
        return await !this.hasReceivedInfo;
    }

    async _apply(gameInfo: GameInfo, context: Context): Promise<GameInfo> {
        const _gameInfo = await super._apply(gameInfo, context);
        this.hasReceivedInfo = true;
        return _gameInfo;
    }
}

abstract class NightInfoRequester<
    T,
    TInfoProvider extends InfoProvider<T>
> extends InfoRequester<T, TInfoProvider> {
    applicablePhases: Phase = Phase.Night;
}

abstract class OnceNightInfoRequester<
    T,
    TInfoProvider extends InfoProvider<T>
> extends OnceInfoRequester<T, TInfoProvider> {
    applicablePhases: Phase = Phase.Night;

    async isEligible(gameInfo: GameInfo): Promise<boolean> {
        return (await super.isEligible(gameInfo)) && gameInfo.gamePhase.isNight;
    }
}

abstract class FirstNightInfoRequester<
    T,
    TInfoProvider extends InfoProvider<T>
> extends OnceNightInfoRequester<T, TInfoProvider> {
    async isEligible(gameInfo: GameInfo): Promise<boolean> {
        return (
            (await super.isEligible(gameInfo)) &&
            gameInfo.gamePhase.isFirstNight
        );
    }
}

abstract class EveryAliveNightInfoRequester<
    T,
    TInfoProvider extends InfoProvider<T>
> extends NightInfoRequester<T, TInfoProvider> {
    async isEligible(gameInfo: GameInfo): Promise<boolean> {
        return (
            gameInfo.gamePhase.isNight &&
            (await gameInfo.isPlayerAlive(this.targetPlayer))
        );
    }
}

abstract class EveryAliveNonfirstNightInfoRequester<
    T,
    TInfoProvider extends InfoProvider<T>
> extends NightInfoRequester<T, TInfoProvider> {
    async isEligible(gameInfo: GameInfo): Promise<boolean> {
        return (
            gameInfo.gamePhase.isNonfirstNight &&
            (await gameInfo.isPlayerAlive(this.targetPlayer))
        );
    }
}

interface OneCharacterForTwoPlayers {
    players: [Player, Player];
    character: CharacterToken;
}

abstract class OneCharacterForTwoPlayersInfoProvider<
    TInfo extends Partial<OneCharacterForTwoPlayers>,
    // eslint-disable-next-line unused-imports/no-unused-vars
    TCharacter
> extends InfoProvider<TInfo> {
    declare targetPlayer: Player;

    protected abstract expectedCharacterType: typeof CharacterType;

    protected _trueInfoCandidates(gameInfo: GameInfo) {
        const infoCandidates = gameInfo.players
            .isNot(this.targetPlayer)
            .isCharacterType(this.expectedCharacterType)
            .map((player) =>
                Generator.once([player])
                    .cartesian_product(
                        gameInfo.players.exclude([this.targetPlayer, player])
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
            .isNot(this.targetPlayer)
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

export interface WasherwomanInfo extends OneCharacterForTwoPlayers {}

export class WasherwomanInfoProvider extends OneCharacterForTwoPlayersInfoProvider<
    WasherwomanInfo,
    typeof Washerwoman
> {
    protected expectedCharacterType: typeof CharacterType = Townsfolk;
}

export class WasherwomanInfoRequester extends FirstNightInfoRequester<
    WasherwomanInfo,
    WasherwomanInfoProvider
> {
    get description() {
        return `${this.targetPlayer} is a Washerwoman who learns that a particular Townsfolk character is in play, but not exactly which player it is.`;
    }

    constructor(targetPlayer: Player, isTrue: boolean) {
        super();
        this.infoProvider = new WasherwomanInfoProvider(targetPlayer, isTrue);
    }
}

export interface LibrarianInfo extends Partial<OneCharacterForTwoPlayers> {
    hasOutsider: boolean;
    players?: [Player, Player];
    character?: CharacterToken;
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

export class LibrarianInfoRequester extends FirstNightInfoRequester<
    LibrarianInfo,
    LibrarianInfoProvider
> {
    get description() {
        return `${this.targetPlayer} is a Librarian who learns that a particular Outsider character is in play, but not exactly which player it is.`;
    }

    constructor(targetPlayer: Player, isTrue: boolean) {
        super();
        this.infoProvider = new LibrarianInfoProvider(targetPlayer, isTrue);
    }
}

export interface InvestigatorInfo extends OneCharacterForTwoPlayers {}

export class InvestigatorInfoProvider extends OneCharacterForTwoPlayersInfoProvider<
    InvestigatorInfo,
    typeof Investigator
> {
    protected expectedCharacterType: typeof CharacterType = Minion;
}

export class InvestigatorInfoRequester extends FirstNightInfoRequester<
    InvestigatorInfo,
    InvestigatorInfoProvider
> {
    get description() {
        return `${this.targetPlayer} is a Investigator who learns that a particular Minion character is in play, but not exactly which player it is.`;
    }

    constructor(targetPlayer: Player, isTrue: boolean) {
        super();
        this.infoProvider = new InvestigatorInfoProvider(targetPlayer, isTrue);
    }
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

export class ChefInfoRequester extends FirstNightInfoRequester<
    ChefInfo,
    ChefInfoProvider
> {
    get description() {
        return `${this.targetPlayer} is a Chef who knows if evil players are sitting next to each other.`;
    }

    constructor(targetPlayer: Player, isTrue: boolean) {
        super();
        this.infoProvider = new ChefInfoProvider(targetPlayer, isTrue);
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
        const aliveNeighbors = await seating.getAliveNeighbors(
            this.targetPlayer
        );
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

export class EmpathInfoRequester extends EveryAliveNightInfoRequester<
    EmpathInfo,
    EmpathInfoProvider
> {
    get description() {
        return `${this.targetPlayer} is a Empath who keeps learning if their living neighbours are good or evil.`;
    }

    constructor(targetPlayer: Player, isTrue: boolean) {
        super();
        this.infoProvider = new EmpathInfoProvider(targetPlayer, isTrue);
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
    chosen?: [Player, Player];

    getChosenPlayers(gameInfo: GameInfo): Players | undefined {
        if (this.chosen === undefined) {
            return undefined;
        }

        return gameInfo.players.intersect(this.chosen);
    }

    _trueInfoCandidates(gameInfo: GameInfo) {
        const chosenPlayers = this.getChosenPlayers(gameInfo);

        if (chosenPlayers === undefined) {
            return InfoProvider.NO_INFO;
        } else {
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
    }

    _falseInfoCandidates(gameInfo: GameInfo) {
        const chosenPlayers = this.getChosenPlayers(gameInfo);

        if (chosenPlayers === undefined) {
            return InfoProvider.NO_INFO;
        } else {
            return Generator.once([
                {
                    players: this.chosen,
                    hasDemon: true,
                } as FortuneTellerInfo,
                {
                    players: this.chosen,
                    hasDemon: false,
                } as FortuneTellerInfo,
            ]);
        }
    }
}

export class FortuneTellerInfoRequester extends EveryAliveNightInfoRequester<
    FortuneTellerInfo,
    FortuneTellerInfoProvider
> {
    get description() {
        return `${this.targetPlayer} is a FortuneTeller who detects who the Demon is, but sometimes thinks good players are Demons.`;
    }

    getChosenPlayers(gameInfo: GameInfo): Players | undefined {
        return this.infoProvider.getChosenPlayers(gameInfo);
    }

    setChosenPlayers(players: [Player, Player] | undefined) {
        this.infoProvider.chosen = players;
    }

    constructor(targetPlayer: Player, isTrue: boolean) {
        super();
        this.infoProvider = new FortuneTellerInfoProvider(targetPlayer, isTrue);
    }
}

/**
 * {@link `undertaker["ability"]`}
 * "Each night*, you learn which character died by execution today."
 */
export interface UndertakerInfo {
    player: Player;
    character: CharacterToken;
}

export class UndertakerInfoProvider extends InfoProvider<UndertakerInfo> {
    _trueInfoCandidates(gameInfo: GameInfo) {
        const executed = gameInfo.executed;

        if (executed === undefined) {
            return InfoProvider.NO_INFO;
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
            return InfoProvider.NO_INFO;
        } else {
            return Generator.once(gameInfo.characterSheet.characters).map(
                (character) =>
                    ({
                        player: executed,
                        character,
                    } as UndertakerInfo)
            );
        }
    }
}

export class UndertakerInfoRequester extends EveryAliveNonfirstNightInfoRequester<
    UndertakerInfo,
    UndertakerInfoProvider
> {
    get description() {
        return `${this.targetPlayer} is a Undertaker who learns which character was executed today.`;
    }

    constructor(targetPlayer: Player, isTrue: boolean) {
        super();
        this.infoProvider = new UndertakerInfoProvider(targetPlayer, isTrue);
    }
}

/**
 * {@link `ravenkeeper["ability"]`}
 * "If you die at night, you are woken to choose a player: you learn their character."
 */
export interface _RavenkeeperInfo {
    player: Player;
    character: CharacterToken;
}

export type RavenkeeperInfo = _RavenkeeperInfo | Record<string, never>;

export class RavenkeeperInfoProvider extends InfoProvider<RavenkeeperInfo> {
    protected chosenPlayerId?: string;

    getChosenPlayer(gameInfo: GameInfo): Player | undefined {
        return gameInfo._getPlayer(this.chosenPlayerId);
    }

    choosePlayer(player: Player) {
        this.chosenPlayerId = player.id;
    }

    _trueInfoCandidates(gameInfo: GameInfo) {
        const chosen = this.getChosenPlayer(gameInfo);

        if (chosen === undefined) {
            return InfoProvider.EMPTY_INFO;
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
            return InfoProvider.EMPTY_INFO;
        } else {
            return Generator.once(gameInfo.characterSheet.characters).map(
                (character) =>
                    ({
                        player: chosen,
                        character,
                    } as RavenkeeperInfo)
            );
        }
    }
}

export class RavenkeeperInfoRequester extends OnceNightInfoRequester<
    RavenkeeperInfo,
    RavenkeeperInfoProvider
> {
    get description() {
        return `${this.targetPlayer} is a Ravenkeeper who learns one player's character if dies at night.`;
    }

    async isEligible(gameInfo: GameInfo): Promise<boolean> {
        if (await super.isEligible(gameInfo)) {
            const player = await gameInfo.getPlayer(this.targetPlayer);
            return player.dead;
        }
        return false;
    }

    constructor(targetPlayer: Player, isTrue: boolean) {
        super();
        this.infoProvider = new RavenkeeperInfoProvider(targetPlayer, isTrue);
    }
}

export type InfoRequesters = ReturnType<typeof InfoRequester.of>;
