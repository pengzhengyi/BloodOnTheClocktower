import type { ICharacter } from '../character/character';
import type { IPlayer } from '../player';
import { RecoverableGameError } from './exception';

export class CannotDetermineCharacterType extends RecoverableGameError {
    static description = 'Cannot determine character type of a character';

    constructor(
        readonly player?: IPlayer,
        readonly character?: ICharacter,
        readonly type?: string
    ) {
        super(CannotDetermineCharacterType.description);
    }
}
