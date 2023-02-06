import type { ScriptConstraints } from '../script-tool';
import { RecoverableGameError } from './exception';

export class InvalidScriptConstraints extends RecoverableGameError {
    static description = 'Some script constraints are invalid';

    constructor(
        readonly constraints: Partial<ScriptConstraints>,
        reason?: Error,
        details = ''
    ) {
        super(InvalidScriptConstraints.description + details);

        if (reason !== undefined) {
            this.from(reason);
        }
    }
}
