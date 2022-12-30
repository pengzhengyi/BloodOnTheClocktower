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

import type { CharacterToken } from './character';
import type { Player } from './player';
import { Generator } from './collections';
import type { GameInfo } from './gameinfo';
import { Players } from './players';
import { Context, InfoProcessor } from './infoprocessor';
import { Phase } from './gamephase';
import { GAME_UI } from '~/interaction/gameui';
import { FortuneTeller } from '~/content/characters/output/fortuneteller';

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
            case FortuneTeller:
                return FortuneTellerInfoRequester;
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

abstract class NightInfoRequester<
    T,
    TInfoProvider extends InfoProvider<T>
> extends InfoRequester<T, TInfoProvider> {
    applicablePhases: Phase = Phase.Night;
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

export type InfoRequesters = ReturnType<typeof InfoRequester.of>;
