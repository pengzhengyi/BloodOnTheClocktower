import { type Dayjs } from 'dayjs';
import type { IDiary } from '../clocktower/diary';
import type { Event as ClocktowerEvent } from '../clocktower/event';
import { RecoverableGameError } from './exception';

export class PastMomentRewrite extends RecoverableGameError {
    static description = "Attempt to rewrite a past event's moment";

    constructor(
        readonly diary: IDiary,
        readonly event: ClocktowerEvent,
        readonly recordedTimestamp: Dayjs,
        readonly newTimestamp: Dayjs
    ) {
        super(PastMomentRewrite.description);
    }
}
