import type { CharacterToken } from '../character/character';
import type { ICharacterTypeToCharacter } from '../types';
import { RecoverableGameError } from './exception';

export class AddAlreadyExistingInPlayCharacter extends RecoverableGameError {
    static description =
        'Choose to add a character that is already an in play character';

    constructor(
        readonly character: CharacterToken,
        readonly inPlayCharacters: ICharacterTypeToCharacter
    ) {
        super(AddAlreadyExistingInPlayCharacter.description);
    }
}
