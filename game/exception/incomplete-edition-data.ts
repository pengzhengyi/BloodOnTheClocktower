import type { RoleData } from '../types';
import { RecoverableGameError } from './exception';

export class IncompleteEditionData extends RecoverableGameError {
    static description = 'Edition data is missing required key(s)';

    constructor(
        readonly editionData: Partial<RoleData>,
        readonly missingKeyName: string
    ) {
        super(IncompleteEditionData.description);
    }
}
