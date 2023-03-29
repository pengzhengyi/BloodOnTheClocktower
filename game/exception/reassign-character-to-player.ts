import type { CharacterToken } from '../character/character';
import type { IPlayer } from '../player/player';
import { RecoverableGameError } from './exception';

export class ReassignCharacterToPlayer extends RecoverableGameError {
    static description =
        'player already has an assigned character, confirm to reassign';

    shouldReassign = false;

    constructor(
        readonly player: IPlayer,
        readonly existingCharacter: CharacterToken,
        readonly newCharacter: CharacterToken
    ) {
        super(ReassignCharacterToPlayer.description);
    }
}
