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
    async getPlayerAboutToDie(
        numAlivePlayer: number
    ): Promise<Player | undefined> {
        let highestNumVotes = 0;
        let playerAboutToDie: Player | undefined;

        for (const nomination of this.nominations) {
            try {
                const vote = nomination.vote;
                await new NoVoteInNomination(nomination).throwWhen((error) =>
                    error.nomination.isVoteNotStarted()
                );

                await new NoVotesWhenCountingVote(vote!).throwWhen((error) =>
                    error.vote.hasNotVoted()
                );

                if (!(await vote!.hasEnoughVoteToExecute(numAlivePlayer))) {
                    continue;
                }

                const numVotes = vote!.votes!.length;

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

    async addNomination(nomination: Nomination) {
        const checks = await Promise.all([
            this.checkNominatorNotNominatedBefore(nomination),
            this.checkNominatedNotNominatedBefore(nomination),
        ]);

        if (checks.every((check) => check)) {
            this.nominations.push(nomination);
        }
    }

    private async checkNominatorNotNominatedBefore(
        nomination: Nomination
    ): Promise<boolean> {
        const pastNomination = this.getPastNomination((pastNomination) =>
            Object.is(pastNomination.nominator, nomination.nominator)
        );
        if (pastNomination !== undefined) {
            const error = new NominatorNominatedBefore(
                nomination,
                pastNomination,
                nomination.nominator
            );
            await error.resolve();
            return error.forceAllowNomination;
        }

        return true;
    }

    private async checkNominatedNotNominatedBefore(
        nomination: Nomination
    ): Promise<boolean> {
        const pastNomination = this.getPastNomination((pastNomination) =>
            Object.is(pastNomination.nominated, nomination.nominated)
        );
        if (pastNomination !== undefined) {
            const error = new NominatedNominatedBefore(
                nomination,
                pastNomination,
                nomination.nominated
            );
            await error.resolve();
            return error.forceAllowNomination;
        }

        return true;
    }
}
