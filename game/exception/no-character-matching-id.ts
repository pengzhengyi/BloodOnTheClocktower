import { RecoverableGameError } from './exception';

export class NoCharacterMatchingId extends RecoverableGameError {
    static description = 'Cannot find a character with matching id';

    declare correctedId: string;

    constructor(readonly id?: string) {
        super(NoCharacterMatchingId.description);

        if (id !== undefined) {
            this.correctedId = id;
        }
    }
}
