import type { CharacterToken } from '../character/character';
import type { CharacterType } from '../character/character-type';
import { RecoverableGameError } from './exception';

export class CharacterSheetCreationFailure extends RecoverableGameError {
    static description =
        'Cannot initialize character sheet from provided arguments';

    constructor(
        readonly characters?: Iterable<CharacterToken>,
        readonly characterTypes?: Map<
            typeof CharacterType,
            Array<CharacterToken>
        >
    ) {
        super(CharacterSheetCreationFailure.description);
    }
}
