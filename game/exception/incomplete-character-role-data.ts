import type { RoleData } from '../types';
import { RecoverableGameError } from './exception';

export class IncompleteCharacterRoleData extends RecoverableGameError {
    static description = 'Role data is missing required key(s)';

    constructor(
        readonly roleData: Partial<RoleData>,
        readonly missingKeyName: string
    ) {
        super(IncompleteCharacterRoleData.description);
    }
}
