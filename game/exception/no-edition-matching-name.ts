import { RecoverableGameError } from './exception';

export class NoEditionMatchingId extends RecoverableGameError {
    static description = 'Cannot find a edition with matching id';

    declare correctedEditionId: string;

    constructor(readonly editionId?: string) {
        super(NoEditionMatchingId.description);

        if (editionId !== undefined) {
            this.correctedEditionId = editionId;
        }
    }
}
