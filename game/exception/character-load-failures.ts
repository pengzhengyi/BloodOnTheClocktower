import type { CharacterToken } from '../character/character';
import type { GameError, AggregateError } from './exception';
import { RecoverableGameError } from './exception';

export class CharacterLoadFailures<
    E extends Error = GameError
> extends RecoverableGameError {
    static description = 'Fail to load some characters';

    declare cause: AggregateError<E>;

    get failures() {
        return this.cause.errors;
    }

    constructor(
        failures: Iterable<E>,
        readonly loadedCharacters: Array<CharacterToken>
    ) {
        super(CharacterLoadFailures.description);

        this.aggregate(failures);
    }
}
