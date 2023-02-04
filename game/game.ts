/* eslint-disable no-use-before-define */
import { Alignment } from './alignment';
import { type IPlayer } from './player';
import type { IPlayers } from './players';
import { type Edition } from './edition';
import { EffectTarget, type IEffectTarget } from './effect/effect-target';
import { type StoryTeller } from './storyteller';
import type { ITownSquare } from './town-square';
import type { IDiary } from './diary';
import type { ISetupSheet } from './setup-sheet';
import { InteractionEnvironment } from '~/interaction/environment';

export interface IGame extends IEffectTarget<IGame> {
    // fundamental properties of IGame
    readonly setupSheet: ISetupSheet;
    readonly townSquare: ITownSquare;
    readonly storyTeller: StoryTeller;
    readonly players: IPlayers;
    readonly edition: Edition;

    // utility properties of IGame
    readonly today: IDiary;

    // capabilities of IGame
    setWinningTeam(winningTeam: Alignment, reason?: string): void;
    getWinningTeam(players: Iterable<IPlayer>): Promise<Alignment | undefined>;
}

export class Game extends EffectTarget<Game> implements IGame {
    protected static defaultEnabledProxyHandlerPropertyNames: Array<
        keyof ProxyHandler<Game>
    > = ['get'];

    static init(
        enabledProxyHandlerPropertyNames?: Array<keyof ProxyHandler<Game>>
    ) {
        if (enabledProxyHandlerPropertyNames === undefined) {
            enabledProxyHandlerPropertyNames =
                this.defaultEnabledProxyHandlerPropertyNames;
        }

        const game = new this(enabledProxyHandlerPropertyNames);

        return game.getProxy();
    }

    winningTeam?: Alignment;

    declare setupSheet: ISetupSheet;

    declare townSquare: ITownSquare;

    declare storyTeller: StoryTeller;

    get players(): IPlayers {
        return this._players.clone();
    }

    protected declare _players: IPlayers;

    declare edition: Edition;

    get today(): IDiary {
        return this.townSquare.clockTower.today;
    }

    // eslint-disable-next-line no-useless-constructor
    protected constructor(
        enabledProxyHandlerPropertyNames?: Array<keyof ProxyHandler<Game>>
    ) {
        super(enabledProxyHandlerPropertyNames);
    }

    async setWinningTeam(winningTeam: Alignment, reason?: string) {
        const reasonPrompt = reason === undefined ? '' : ` because ${reason}`;

        if (
            await InteractionEnvironment.current.gameUI.storytellerConfirm(
                `${winningTeam} will be the winning team${reasonPrompt}?`
            )
        ) {
            this.winningTeam = winningTeam;
        }
    }

    async getWinningTeam(
        players: Iterable<IPlayer>
    ): Promise<Alignment | undefined> {
        let evilWinConditionReached = true;
        let goodWinConditionReached = true;

        let aliveNontravellerPlayerCount = 0;
        for (const player of players) {
            if (goodWinConditionReached && (await player.isTheDemon)) {
                goodWinConditionReached = false;
            }

            if (evilWinConditionReached && (await player.isAliveNontraveller)) {
                aliveNontravellerPlayerCount++;

                if (aliveNontravellerPlayerCount > 2) {
                    evilWinConditionReached = false;
                }
            }

            if (!goodWinConditionReached && !evilWinConditionReached) {
                return undefined;
            }
        }

        if (goodWinConditionReached) {
            return Alignment.Good;
        }

        if (evilWinConditionReached) {
            return Alignment.Evil;
        }
    }
}
