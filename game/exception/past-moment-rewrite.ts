import { type Dayjs } from 'dayjs';
import type { IDiary, Event as ClocktowerEvent } from '../clocktower/diary';
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
