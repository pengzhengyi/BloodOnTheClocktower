import { RecoverableGameError } from './exception';

export class NoEditionMatchingName extends RecoverableGameError {
    static description = 'Cannot find a edition with matching name';

    declare correctedEditionName: string;

    constructor(readonly editionName?: string) {
        super(NoEditionMatchingName.description);

        if (editionName !== undefined) {
            this.correctedEditionName = editionName;
        }
    }
}
