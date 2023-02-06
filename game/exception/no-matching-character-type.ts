import { RecoverableGameError } from './exception';

export class NoMatchingCharacterType extends RecoverableGameError {
    static description = 'Cannot find a character type matching the name';

    declare correctedType: string;

    constructor(readonly type?: string) {
        super(NoMatchingCharacterType.description);

        if (type !== undefined) {
            this.correctedType = type;
        }
    }
}
