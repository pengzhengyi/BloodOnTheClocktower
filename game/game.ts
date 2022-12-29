import { Alignment } from './alignment';
import { Player } from './player';
import { Players } from './players';
import { Edition } from './edition';
import { StoryTeller } from './storyteller';
import { TownSquare } from './townsquare';
import { GAME_UI } from '~/interaction/gameui';

export class Game {
    winningTeam?: Alignment;

    declare townSquare: TownSquare;

    declare storyTeller: StoryTeller;

    declare players: Players;

    declare edition: Edition;

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
