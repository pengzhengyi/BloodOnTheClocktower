import { type Dayjs } from 'dayjs';
import type { IDiary, Event as ClocktowerEvent } from '../diary';
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
