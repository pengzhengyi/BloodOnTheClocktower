import { Nomination } from './nomination';
import { Player } from './player';
import {
    NominatedNominatedBefore,
    NominatorNominatedBefore,
    NoVoteInNomination,
    NoVotesWhenCountingVote,
} from './exception';
import { Predicate } from './types';

/**
 * {@link `glossary["Execution"]`}
 * The group decision to kill a player other than a Traveller during the day. There is a maximum of one execution per day, but there may be none. A nominated player is executed if they got votes equal to at least half the number of alive players, and more votes than any other nominated player.
 */
export class Execution {
    executed?: Player = undefined;
    readonly nominations: Array<Nomination> = [];

    /**
     * {@link `glossary["About to die"]`}
     * @return The player who has enough votes to be executed and more votes than any other player today.
     *
     * @param numAlivePlayer Number of alive players in game.
     */
    getPlayerAboutToDie(numAlivePlayer: number): Player | undefined {
        let highestNumVotes = 0;
        let playerAboutToDie: Player | undefined;

        for (const nomination of this.nominations) {
            try {
                const vote = nomination.vote;
                if (vote === undefined) {
                    throw new NoVoteInNomination(nomination);
                }

                if (vote.votes === undefined) {
                    throw new NoVotesWhenCountingVote(vote);
                }

                if (!vote.hasEnoughVoteToExecute(numAlivePlayer)) {
                    continue;
                }

                const numVotes = vote.votes.length;

                if (numVotes > highestNumVotes) {
                    highestNumVotes = numVotes;
                    playerAboutToDie = nomination.nominated;
                } else if (numVotes === highestNumVotes) {
                    playerAboutToDie = undefined;
                }
            } catch (error) {
                if (error instanceof NoVotesWhenCountingVote) {
                    error.nomination = nomination;
                }

                throw error;
            }
        }

        return playerAboutToDie;
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
