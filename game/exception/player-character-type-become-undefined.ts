import type { CharacterType } from '../character/character-type';
import type { IPlayer } from '../player';
import { RecoverableGameError } from './exception';

export class PlayerCharacterTypeBecomeUndefined extends RecoverableGameError {
    static description =
        'player character type unexpectedly change to undefined';

    constructor(
        readonly player: IPlayer,
        readonly previousCharacterType: typeof CharacterType,
        readonly newCharacterType: undefined,
        readonly reason?: string
    ) {
        super(PlayerCharacterTypeBecomeUndefined.description);
    }
}
