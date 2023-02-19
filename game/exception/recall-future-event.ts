import type { Event as ClocktowerEvent } from '../clocktower/diary';
import { RecoverableGameError } from './exception';

export class RecallFutureEvent extends RecoverableGameError {
    static description =
        'Trying to recall a future event not experienced in game';

    constructor(
        readonly requestedDate: number,
        readonly requestedEvent: ClocktowerEvent,
        readonly furthestDate: number
    ) {
        super(RecallFutureEvent.description);
    }
}
