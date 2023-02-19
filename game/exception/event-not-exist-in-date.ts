import type { IDiary, Event as ClocktowerEvent } from '../clocktower/diary';
import { RecoverableGameError } from './exception';

export class EventNotExistInDate extends RecoverableGameError {
    static description = 'Provided event does not exist in given date';

    constructor(readonly event: ClocktowerEvent, readonly diary: IDiary) {
        super(EventNotExistInDate.description);
    }
}
