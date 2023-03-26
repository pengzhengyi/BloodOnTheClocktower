import type { IVote } from '../voting/vote';
import { RecoverableGameError } from './exception';

/**
 * An operation might not be supported for a vote at given state. For example, check votes when vote is not collected.
 */
export class UnsupportedOperationForVote extends RecoverableGameError {
    static description = 'Unsupported operation for vote';

    constructor(readonly vote: IVote, additionalMessage?: string) {
        super(
            UnsupportedOperationForVote.description +
                (additionalMessage ? `: ${additionalMessage}` : '')
        );
    }
}
