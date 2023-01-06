/* eslint-disable no-use-before-define */
import { Alignment } from './alignment';
import type { Diary } from './clocktower';
import { Player } from './player';
import { Players } from './players';
import { Edition } from './edition';
import { EffectTarget } from './effecttarget';
import { StoryTeller } from './storyteller';
import { TownSquare } from './townsquare';
import { GAME_UI } from '~/interaction/gameui';

export class Game extends EffectTarget<Game> {
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

    declare townSquare: TownSquare;

    declare storyTeller: StoryTeller;

    declare players: Players;

    declare edition: Edition;

    get alivePlayers(): Players {
        return this.players.clone().alive;
    }

    get today(): Diary {
        return this.townSquare.clockTower.today;
    }

    get hasExecution(): boolean {
        return this.today.hasExecution;
    }

    // eslint-disable-next-line no-useless-constructor
    protected constructor(
        enabledProxyHandlerPropertyNames?: Array<keyof ProxyHandler<Game>>
    ) {
        super(enabledProxyHandlerPropertyNames);
    }

    async setWinningTeam(winningTeam: Alignment) {
        if (
            await GAME_UI.storytellerConfirm(
                `${winningTeam} will be the winning team?`
            )
        ) {
            this.winningTeam = winningTeam;
        }
    }

    getWinningTeam(players: Iterable<Player>): Alignment | undefined {
        let evilWinConditionReached = true;
        let goodWinConditionReached = true;

        let aliveNontravellerPlayerCount = 0;
        for (const player of players) {
            if (goodWinConditionReached && player.isTheDemon) {
                goodWinConditionReached = false;
            }

            if (evilWinConditionReached && player.isAliveNontraveller) {
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
