import type { IExecution } from '../voting/execution';
import type { IPlayer } from '../player';
import { RecoverableGameError } from './exception';

export class AttemptMoreThanOneExecution extends RecoverableGameError {
    static description = 'There is a maximum of one execution per day';

    constructor(
        readonly execution: IExecution,
        readonly executed: IPlayer,
        readonly attemptedToExecute: IPlayer
    ) {
        super(AttemptMoreThanOneExecution.description);
    }
}
