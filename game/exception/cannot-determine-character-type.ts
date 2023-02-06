import type { CharacterToken } from '../character/character';
import type { IPlayer } from '../player';
import { RecoverableGameError } from './exception';

export class CannotDetermineCharacterType extends RecoverableGameError {
    static description = 'Cannot determine character type of a character';

    constructor(
        readonly player?: IPlayer,
        readonly character?: CharacterToken,
        readonly type?: string
    ) {
        super(CannotDetermineCharacterType.description);
    }
}
