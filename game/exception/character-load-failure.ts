import { RecoverableGameError } from './exception';

export class CharacterLoadFailure extends RecoverableGameError {
    static description = 'Fail to load a character';

    constructor(readonly id: string, readonly reason: Error) {
        super(CharacterLoadFailure.description);
        this.from(reason);
    }
}
