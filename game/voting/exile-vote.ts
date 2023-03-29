import type { IVote } from './vote';
import { Vote } from './vote';
import { VoteKind } from './vote-kind';

export interface IExileVote extends IVote {
    readonly kind: VoteKind.ForExile;
}

export class ExileVote extends Vote implements IExileVote {
    readonly kind = VoteKind.ForExile;
}
