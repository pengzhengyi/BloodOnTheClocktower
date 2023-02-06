import type { CharacterToken } from '../character/character';
import type { IPlayers } from '../players';
import { RecoverableGameError } from './exception';

export class IncorrectNumberOfCharactersToAssign extends RecoverableGameError {
    static description =
        'the number of characters to assign does not match the number of players';

    constructor(
        readonly players: IPlayers,
        readonly characters: Array<CharacterToken>
    ) {
        super(IncorrectNumberOfCharactersToAssign.description);
    }
}
