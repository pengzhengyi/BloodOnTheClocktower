import { RecoverableGameError } from './exception';

export class RecallFutureDate extends RecoverableGameError {
    static description =
        'Trying to recall a future date not experienced in game';

    constructor(readonly requestedDate: number, readonly furthestDate: number) {
        super(RecallFutureDate.description);
    }
}
