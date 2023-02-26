import type { Nomination } from '../nomination';
import type { Vote } from '../voting/vote';
import { RecoverableGameError } from './exception';

export class NoVotesWhenCountingVote extends RecoverableGameError {
    static description = 'Cannot determine who voted when counting votes';

    constructor(readonly vote: Vote, public nomination?: Nomination) {
        super(NoVotesWhenCountingVote.description);
    }
}
