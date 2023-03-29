import type { VoteKind } from '../voting/vote-kind';
import { RecoverableGameError } from './exception';

export class UnsupportedVoteKind extends RecoverableGameError {
    static description = 'Operation not supported for provided kind of vote';

    constructor(
        readonly unsupportedVoteKind: VoteKind,
        readonly additionalDescription?: string
    ) {
        super(
            UnsupportedVoteKind.description + additionalDescription ===
                undefined
                ? ''
                : `: ${additionalDescription}`
        );
    }
}
