import { Nomination } from './nomination';
import { Player } from './player';
import {
    NominatedNominatedBefore,
    NominatorNominatedBefore,
    NoVoteInNomination,
    NoVotesWhenCountingVote,
} from './exception';
import { Predicate } from './types';

export class Execution {
    executed?: Player = undefined;
    readonly nominations: Array<Nomination> = [];

    static getPlayerToExecute(
        nominations: IterableIterator<Nomination>,
        numAlivePlayer: number
    ): Player | undefined {
        let highestNumVotes = 0;
        let playerToExecute: Player | undefined;

        for (const nomination of nominations) {
            try {
                const hasEnoughVoteToExecute =
                    nomination.vote?.hasEnoughVoteToExecute(numAlivePlayer);

                if (hasEnoughVoteToExecute === undefined) {
                    throw new NoVoteInNomination(nomination);
                }

                const numVotes = nomination.vote?.votes?.length!;

                if (numVotes > highestNumVotes) {
                    highestNumVotes = numVotes;
                    playerToExecute = nomination.nominated;
                } else if (numVotes === highestNumVotes) {
                    playerToExecute = undefined;
                }
            } catch (error) {
                if (error instanceof NoVotesWhenCountingVote) {
                    error.nomination = nomination;
                }

                throw error;
            }
        }

        return playerToExecute;
    }

    getPastNomination(
        predicate: Predicate<Nomination>
    ): Nomination | undefined {
        return this.nominations.find(predicate);
    }

    addNomination(nomination: Nomination) {
        this.checkNominatorNotNominatedBefore(nomination);
        this.checkNominatedNotNominatedBefore(nomination);

        this.nominations.push(nomination);
    }

    private checkNominatorNotNominatedBefore(nomination: Nomination) {
        const pastNomination = this.getPastNomination((pastNomination) =>
            Object.is(pastNomination.nominator, nomination.nominator)
        );
        if (pastNomination !== undefined) {
            throw new NominatorNominatedBefore(
                nomination,
                pastNomination,
                nomination.nominator
            );
        }
    }

    private checkNominatedNotNominatedBefore(nomination: Nomination) {
        const pastNomination = this.getPastNomination((pastNomination) =>
            Object.is(pastNomination.nominated, nomination.nominated)
        );
        if (pastNomination !== undefined) {
            throw new NominatedNominatedBefore(
                nomination,
                pastNomination,
                nomination.nominated
            );
        }
    }
}
