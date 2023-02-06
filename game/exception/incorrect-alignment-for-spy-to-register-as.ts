import type { Alignment } from '../alignment';
import type { CharacterToken } from '../character/character';
import { RecoverableGameError } from './exception';

export class IncorrectAlignmentForSpyToRegisterAs extends RecoverableGameError {
    static description = 'The spy should only register as good or evil';

    declare correctedAlignmentToRegisterAs: Alignment;

    constructor(
        readonly characterToRegisterAs: CharacterToken,
        readonly alignmentToRegisterAs?: Alignment
    ) {
        super(IncorrectAlignmentForSpyToRegisterAs.description);

        if (alignmentToRegisterAs !== undefined) {
            this.correctedAlignmentToRegisterAs = alignmentToRegisterAs;
        }
    }
}
