import { RecoverableGameError } from './exception';

export class UnsupportedOperation extends RecoverableGameError {
    static description = 'Operation not supported';

    constructor(readonly additionalDescription?: string) {
        super(
            UnsupportedOperation.description + additionalDescription ===
                undefined
                ? ''
                : `: ${additionalDescription}`
        );
    }
}
