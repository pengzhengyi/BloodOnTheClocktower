import { Alignment } from './alignment';
import { Player } from './player';
import { GameUI } from '~/interaction/gameui';

export class Game {
    winningTeam?: Alignment;

    async setWinningTeam(winningTeam: Alignment) {
        if (
            await GameUI.storytellerConfirm(
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
