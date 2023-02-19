import { type Dayjs } from 'dayjs';
import type { IDiary } from '../clocktower/diary';
import type { Event as ClocktowerEvent } from '../clocktower/event';
import { RecoverableGameError } from './exception';

export class RecordUnknownEventInDiary extends RecoverableGameError {
    static description =
        'Attempt to record an event that is not one of known types';

    constructor(
        readonly diary: IDiary,
        readonly event: ClocktowerEvent,
        readonly moment: Dayjs
    ) {
        super(RecordUnknownEventInDiary.description);
    }
}
