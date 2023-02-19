import type { IDiary } from '../clocktower/diary';
import type { Event as ClocktowerEvent } from '../clocktower/event';
import { RecoverableGameError } from './exception';

export class EventNotExistInDate extends RecoverableGameError {
    static description = 'Provided event does not exist in given date';

    constructor(readonly event: ClocktowerEvent, readonly diary: IDiary) {
        super(EventNotExistInDate.description);
    }
}
