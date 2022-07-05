import { Alignment } from './alignment';
import { Player } from './player';

export class Game {
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
