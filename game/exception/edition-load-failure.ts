import { RecoverableGameError } from './exception';

export class EditionLoadFailure extends RecoverableGameError {
    static description = 'Fail to load a edition';

    constructor(readonly editionName: string, readonly reason: Error) {
        super(EditionLoadFailure.description);
        this.from(reason);
    }
}
