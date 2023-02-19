import type { CharacterToken } from '../character/character';
import type { ICharacterTypeToCharacter } from '../types';
import { RecoverableGameError } from './exception';

export class RemoveNotExistingInPlayCharacter extends RecoverableGameError {
    static description =
        'Choose to remove a character that is not an in play character';

    constructor(
        readonly character: CharacterToken,
        readonly inPlayCharacters: ICharacterTypeToCharacter
    ) {
        super(RemoveNotExistingInPlayCharacter.description);
    }
}
